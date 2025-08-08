# 🚀 Terra Express API

A robust and scalable API built with **Node.js**, **Express.js**, and **Drizzle ORM**, designed to manage information about various spaces, their features, and user interactions. This API serves as the backbone for a platform focused on discovering and exploring places.

---

## ✨ Key Features

- **RESTful API Endpoints**: Comprehensive routes for managing users, authentication, and various "spaces" (e.g., parks, historical sites, attractions).

- **Automatic Slug Generation**: Human-readable and unique URLs generated for resources like spaces, ensuring clean and SEO-friendly routing.

- **Database Management**: Utilizes the **Drizzle ORM** for efficient, type-safe, and robust database interactions with PostgreSQL.

- **Database Transactions**: Ensures **data consistency and integrity** for complex operations by treating multiple database changes as a single, atomic unit (all or nothing).

- **Secure Authentication**: Robust user authentication and authorization workflows using **JSON Web Tokens (JWTs)**.

- **JSON Schema Validation**: Strong input validation using **Zod** schemas to ensure data integrity and provide clear error feedback.

- **Fast Development Environment**: Powered by **Node.js** with hot-reloading for rapid development and iteration.

---

## 🛠️ Technologies Used

- **Backend Framework**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)

- **Language**: [TypeScript](https://www.typescriptlang.org/)

- **Database**: [PostgreSQL](https://www.postgresql.org/)

- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
  - `drizzle-kit`: For schema definition, migrations, and code generation.

- **Database Driver**: `pg` (for Node.js PostgreSQL client) or `@neondatabase/serverless` (for serverless environments/Neon)

- **Validation**: [Zod](https://zod.dev/)

- **Password Hashing**: [`argon2`](https://www.npmjs.com/package/argon2)

- **Authentication**: [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) (JWTs)

- **Slug Generation**: [`slugify`](https://www.npmjs.com/package/slugify)

- **Development Tools**: `typescript`, `ts-node`, `nodemon`

- **Package Manager**: `npm` or `yarn`

---

## 🚀 Getting Started

Follow these steps to get the Terra Express API running locally on your machine.

### Prerequisites

Ensure you have the following installed before you begin:

- **Node.js**: [Installation Guide](https://nodejs.org/en/download/) (LTS version recommended)

- **npm** or **Yarn**

- A running **PostgreSQL** instance (e.g., via Docker, local installation, or a cloud service like Neon for testing).

- **Docker & Docker Compose**: (Optional, if you use Docker for your local PostgreSQL database) [Installation Guide](https://docs.docker.com/get-docker/)

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/obbylee/terra-express.git
    cd terra-express
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

The project uses environment variables for configuration (e.g., database connection, JWT secret).

1.  **Create your local `.env` file:**
    Copy the example environment file if you have one, or create it manually.
    ```bash
    cp .env.example .env # If you have an example file
    ```
2.  **Configure `.env`:**
    Open the `.env` file and fill in the necessary values.

    ```env
    # .env

    # === Application Environment ===
    NODE_ENV=development # or production
    PORT=3000

    # === Database Configuration ===
    # Example for local PostgreSQL database
    DATABASE_URL="postgresql://user:password@localhost:5432/your_local_db_name"

    # Example for Neon PostgreSQL database (if applicable)
    # DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]-pooler.us-east-1.aws.neon.tech/[dbname]?sslmode=require"

    # === JWT Secret ===
    # IMPORTANT: Change this to a strong, random string for production!
    JWT_SECRET="your_super_secret_jwt_key_here"
    ```

### Database Setup

This project uses **Drizzle ORM** for schema management and migrations. If you're using Docker Compose for your local PostgreSQL, ensure it's running first.

1.  **Start the Database Container (if using Docker Compose):**
    Navigate to the project root and run Docker Compose in detached mode (assuming your `docker-compose.yml` defines a `database` service).

    ```bash
    docker-compose up -d database
    ```

2.  **Generate Drizzle Migrations** (if you've made schema changes):

    ```bash
    npm run db:generate
    ```

    This command typically generates new migration files in your `drizzle/migrations` directory based on your schema changes.

3.  **Run Drizzle Migrations:**
    Apply your database schema and any pending migrations to your PostgreSQL database.

    ```bash
    npm run db:migrate
    ```

4.  **Seed the Database (Optional):**
    Populate your database with initial records for development or testing.
    ```bash
    npm run db:seed
    ```

---

## Running the Application ▶️

### Development Mode (with hot-reloading)

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api` (or your specified PORT).

### 📚 API Endpoints 🗺️

Below is a summary of the main API endpoints. All requests and responses are JSON-based.

### Authentication

- `POST /api/auth/register`
  - Description: Register a new user.

  - Body: `{ "username": "string", "email": "string", "password": "string" }`

  - Response: `{ "token": "jwt_token", "message": "...", "userId": "uuid" }`

- `POST /api/auth/login`
  - Description: Log in an existing user.

  - Body: `{ "identifier": "string (username or email)", "password": "string" }`

  - Response: `{ "token": "jwt_token", "message": "...", "userId": "uuid" }`

### Users

- `GET /api/users`
  - Description: Get a list of all users. (Consider adding pagination/filtering for production)

- `GET /api/users/:identifier`
  - Description: Get a single user by ID, email, or username.

### Categories

- `POST /api/categories`
  - Description: Create a new space category.

  - Requires: `Authorization: Bearer <token>` header.

  - Body: `{ "name": "string", "descriptions": "string" }`

- `GET /api/categories/:identifier`
  - Description: Get a single category by ID (UUID) or name.

- `PATCH /api/categories/:identifier`
  - Description: Update an existing category (partial update).

  - Requires: `Authorization: Bearer <token>` header.

  - Body: `{ "name"?: "string", "descriptions"?: "string" }`

- `DELETE /api/categories/:identifier`
  - Description: Delete a category.

  - Requires: `Authorization: Bearer <token>` header.

### Spaces

- `POST /api/spaces`
  - Description: Create a new space.

  - Requires: `Authorization: Bearer <token>` header.

  - Body: `{ "name": "string", "typeId": "uuid", "categoryIds"?: ["uuid"], "featureIds"?: ["uuid"], ...otherSpaceDetails }`

- `GET /api/spaces`
  - Description: Get a list of all spaces with related data (creator, type, categories, features).

- `PATCH /api/spaces/:identifier`
  - Description: Partially update an existing space.

  - Requires: `Authorization: Bearer <token>` header, user must be the submittedBy owner.

  - Body: `{ "name"?: "string", "typeId"?: "uuid", "categoryIds"?: ["uuid"], "featureIds"?: ["uuid"], ...otherSpaceDetails }`

- `DELETE /api/spaces/:identifier`
  - Description: Delete a space.

  - Requires: `Authorization: Bearer <token>` header, user must be the submittedBy owner.

### 📊 Database Schema Overview

The database is designed with the following main tables and their relationships (managed by Drizzle ORM):

- `users`: Stores user authentication and profile information.

- `space_type`: Defines various types of spaces (e.g., Park, Plaza).

- `category`: Defines categories for spaces (e.g., Historical, Recreational).

- `feature`: Defines features found in spaces (e.g., Wi-Fi, Playground).

- `space`: The core entity, representing a geographical space. It links to users (submitted by) and space_type (one-to-one/many).

- `space_to_categories` (Junction Table): Many-to-many relationship between space and category.

- `space_to_features` (Junction Table): Many-to-many relationship between space and feature.

### 📚 Learning & Contribution

This project is designed to be a strong example of a modern Node.js API. Feel free to explore the codebase, understand the implementation details, and use it as a learning resource for:

- Express.js best practices

- TypeScript for backend development

- Drizzle ORM for database interactions

- Zod for robust schema validation

- Authentication with JWTs

- Implementing transactions for data integrity

- Managing many-to-many relationships

Contributions are highly encouraged!
