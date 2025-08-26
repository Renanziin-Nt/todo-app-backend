# TODO App Backend

A robust, production-ready RESTful API for a Todo application built with **NestJS**, **Prisma**, and **PostgreSQL**. It features JWT authentication, full CRUD operations, and is deployed on **AWS ECS Fargate** with a complete CI/CD pipeline using GitHub Actions and Terraform.

## 🚀 Features

-   **RESTful API** with NestJS framework
-   **JWT Authentication** & secure password hashing
-   **Prisma ORM** for type-safe database access
-   **PostgreSQL** database (hosted on Supabase)
-   **User Management** (Register, Login, Profile, CRUD)
-   **Todo Management** (Create, Read, Update, Delete, Statistics)
-   **API Health Check** endpoint
-   **Dockerized** application
-   **CI/CD Pipeline** with GitHub Actions
-   **Infrastructure as Code (IaC)** with Terraform
-   **Deployed on AWS** (ECS Fargate, Application Load Balancer, ECR, VPC)

## 📁 Project Structure
├── src/
│ ├── auth/ # Authentication logic (JWT, LocalStrategy)
│ ├── user/ # User entity, controller, service, DTOs
│ ├── todo/ # Todo entity, controller, service, DTOs
│ ├── prisma/ # Prisma schema and service
│ └── health/ # Health check endpoint
├── terraform/ # Infrastructure as Code for AWS
├── scripts/ # Utility scripts (e.g., database init)
├── github/workflows/ # GitHub Actions CI/CD pipeline
├── init.sql # Database initialization script
└── dist/ # Compiled JavaScript output

## 🛣️ API Endpoints

| Method | Endpoint                | Description                          | Authentication |
| :----- | :---------------------- | :----------------------------------- | :------------- |
| POST   | `/auth/register`        | Register a new user                  | No             |
| POST   | `/auth/login`           | Login a user (returns JWT)           | No             |
| GET    | `/auth/me`              | Get current user profile             | Yes (JWT)      |
| GET    | `/auth/profile`         | Get current user profile (alias)     | Yes (JWT)      |
| GET    | `/user`                 | Get all users (Admin)                | Yes (JWT)      |
| GET    | `/user/:id`             | Get a user by ID                     | Yes (JWT)      |
| PATCH  | `/user/:id`             | Update a user                        | Yes (JWT)      |
| DELETE | `/user/:id`             | Delete a user                        | Yes (JWT)      |
| **TODO Endpoints** | | | |
| POST   | `/todo`                 | Create a new todo                    | Yes (JWT)      |
| GET    | `/todo`                 | Get all todos for the user           | Yes (JWT)      |
| GET    | `/todo/statistics`      | Get todo statistics (e.g., counts)   | Yes (JWT)      |
| GET    | `/todo/:id`             | Get a specific todo                  | Yes (JWT)      |
| PATCH  | `/todo/:id`             | Update a todo (e.g., mark complete)  | Yes (JWT)      |
| DELETE | `/todo/:id`             | Delete a todo                        | Yes (JWT)      |

## 🚀 Deployment Architecture (AWS via Terraform)

The infrastructure, defined in `terraform/`, provisions the following resources:

-   **Amazon ECR (Elastic Container Registry)**: Stores the Docker image.
-   **Amazon ECS (Elastic Container Service)**: Runs the Docker container in a **Fargate** serverless cluster.
-   **Application Load Balancer (ALB)**: Distributes traffic to the ECS service.
-   **Custom VPC**: With public subnets across two Availability Zones for high availability.
-   **Security Groups**: Restrict traffic to only necessary ports (80, 3000).
-   **CloudWatch Logs**: Centralized logging for the application.
-   **IAM Roles**: Grants necessary permissions for ECS to pull images and write logs.

## ⚙️ CI/CD Pipeline (GitHub Actions)

On every push to the `main` branch, the pipeline automatically:
1.  **Builds** the Docker image.
2.  **Pushes** it to Amazon ECR.
3.  **Plans and Applies** the Terraform configuration to update the infrastructure.
4.  **Forces a new deployment** on ECS to serve the new image.

## 📦 Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Docker
-   Terraform (v1.5.0)
-   AWS CLI configured with credentials

## 🏃‍♂️ Local Development

1.  **Clone and install dependencies:**
    ```bash
    git clone https://github.com/Renanziin-Nt/todo-app-backend
    cd TODO-APP-BACKEND
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file based on `.env.example` and configure your database connection (e.g., local PostgreSQL or Supabase URL).

3.  **Set up the database:**
    ```bash
    npx prisma generate
    npx prisma db push
    # or npx prisma migrate dev
    ```

4.  **Run the application:**
    ```bash
    # development
    npm run start:dev

    # production mode
    npm run build
    npm run start:prod
    ```

5.  **Run tests:**
    ```bash
    npm run test
    npm run test:e2e
    ```

## 🐳 Running with Docker

```bash
# Build the image
docker build -t todo-app-backend .

# Run the container
docker run -p 3000:3000 --env-file .env todo-app-backend