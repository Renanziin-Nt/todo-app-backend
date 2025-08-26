resource "aws_ecr_repository" "app" {
  name                 = "todo-app-backend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "app" {
  name = "todo-app-backend-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Dados para pegar AZs automaticamente
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "todo-app-vpc"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "todo-app-public-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "todo-app-public-b"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "todo-app-igw"
  }
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  
  tags = {
    Name = "todo-app-public-rt"
  }
}

# Route table associations
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "todo-app-alb-sg"
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "todo-app-ecs-sg"
  }
}

resource "aws_lb" "app" {
  name               = "todo-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  
  enable_deletion_protection = false
  
  tags = {
    Name = "todo-app-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "todo-app-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"  # Mudei de /health para / 
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "todo-app-tg"
  }
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# CloudWatch Log Group para ECS
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/todo-app"
  retention_in_days = 7
  
  tags = {
    Name = "todo-app-logs"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "todo-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  
  container_definitions = jsonencode([
    {
      name      = "todo-app-backend"
      image     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "SUPABASE_URL"
          value = "postgresql://postgres.ijyiueuiticjzobfyrxf:Vacareti_%231@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://postgres.ijyiueuiticjzobfyrxf:Vacareti_%231@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
        }
      ]
    }
  ])
  
  tags = {
    Name = "todo-app-task"
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
  
  tags = {
    Name = "ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_service" "app" {
  name            = "todo-app-service"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = 1  # Reduzindo para 1 para simplificar
  
  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]  # Usando subnets públicas
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true  # Necessário para subnets públicas
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "todo-app-backend"
    container_port   = 80
  }
  
  depends_on = [
    aws_lb_listener.app,
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy
  ]
  
  tags = {
    Name = "todo-app-service"
  }
}