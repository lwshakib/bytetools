# Bytetools

Welcome to **Bytetools**! A modern web application built with [Next.js](https://nextjs.org), designed to provide essential utilities for developers and regular users alike.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [Bun](https://bun.sh/) (as the package manager and runtime)
- [PostgreSQL](https://www.postgresql.org/) (if running a local DB instance, though this project is configured for NeonDB)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/lwshakib/bytetools.git
    cd bytetools
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Environment Setup:**

    Copy the `.env.example` file to `.env` and fill in your credentials.

    ```bash
    cp .env.example .env
    ```

    > **Note:** You will need a Database URL (PostgreSQL) and OAuth credentials for Google Authentication.

4.  **Database Setup:**

    Initialize the database using Prisma.

    ```bash
    # Generate Prisma Client
    bun run db:generate

    # Run migrations
    bun run db:migrate
    ```

### Running the Application

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Package Manager:** [Bun](https://bun.sh/)

## 📊 Project Structure

Here is a high-level overview of the project structure using Mermaid:

```mermaid
graph TD
    A[Root] --> B[app]
    A --> C[components]
    A --> D[lib]
    A --> E[prisma]
    A --> F[public]
    
    B --> B1[page.tsx - Home]
    B --> B2[layout.tsx - Root Layout]
    B --> B3[api - API Routes]
    
    C --> C1[ui - Reusable UI Components]
    C --> C2[Other Components]
    
    D --> D1[utils.ts - Utility Functions]
    D --> D2[prisma.ts - DB Client]
    
    E --> E1[schema.prisma - DB Schema]
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:2px
    style B fill:#e1f5fe,stroke:#01579b
    style C fill:#fff9c4,stroke:#fbc02d
    style D fill:#e0f2f1,stroke:#00695c
    style E fill:#f3e5f5,stroke:#7b1fa2
```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

Please adhere to this project's [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is open-source. Please see the [LICENSE](LICENSE) file for details.

## 👤 Author

**lwshakib**

- GitHub: [@lwshakib](https://github.com/lwshakib)

---
*Built with ❤️ by the open-source community.*
