# TaskFlow

TaskFlow is a real-time collaborative task management application built with Next.js, MongoDB, and TailwindCSS. It supports user authentication, task creation, assignment, and management, along with real-time updates using Socket.IO.

## Features

- User authentication with OAuth (GitHub and Facebook).
- Role-based access control (Admin, Creator, Assignee).
- Task creation, assignment, and management.
- File attachments for tasks.
- Real-time updates using Socket.IO.
- Responsive design with TailwindCSS.
- Profile management with avatar uploads.
- Dashboard with task overview and filtering.

## Project Structure

```
.env.local
.gitignore
components.json
middleware.ts
next-env.d.ts
next.config.mjs
oauth-setup-guide.md
package.json
pnpm-lock.yaml
postcss.config.mjs
server.js
tailwind.config.ts
tsconfig.json
.next/
app/
components/
hooks/
lib/
models/
pages/
public/
scripts/
styles/
types/
```

## Installation

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- PNPM (preferred package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/ihrithik007/TaskFlow.git
cd TaskFlow
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

Refer to the [OAuth Setup Guide](oauth-setup-guide.md) for instructions on obtaining GitHub and Facebook OAuth credentials.

### 4. Start the Development Server

Run the following command to start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### 5. Run the Server with Socket.IO

To enable real-time updates, start the custom server:

```bash
node server.js
```

### 6. Build for Production

To build the application for production, run:

```bash
pnpm build
```

Then, start the production server:

```bash
pnpm start
```

## Usage

1. Open the application in your browser at `http://localhost:3000`.
2. Register or log in using GitHub or Facebook.
3. Create tasks, assign them to users, and manage their statuses.
4. View and update your profile, including uploading an avatar.
5. Use the dashboard to monitor tasks and their progress.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
- [Lucide Icons](https://lucide.dev/)

## Contact

For any questions or feedback, feel free to reach out to the repository owner.

```# TaskFlow

TaskFlow is a real-time collaborative task management application built with Next.js, MongoDB, and TailwindCSS. It supports user authentication, task creation, assignment, and management, along with real-time updates using Socket.IO.

## Features

- User authentication with OAuth (GitHub and Facebook).
- Role-based access control (Admin, Creator, Assignee).
- Task creation, assignment, and management.
- File attachments for tasks.
- Real-time updates using Socket.IO.
- Responsive design with TailwindCSS.
- Profile management with avatar uploads.
- Dashboard with task overview and filtering.

## Project Structure

```
.env.local
.gitignore
components.json
middleware.ts
next-env.d.ts
next.config.mjs
oauth-setup-guide.md
package.json
pnpm-lock.yaml
postcss.config.mjs
server.js
tailwind.config.ts
tsconfig.json
.next/
app/
components/
hooks/
lib/
models/
pages/
public/
scripts/
styles/
types/
```

## Installation

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- PNPM (preferred package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/ihrithik007/TaskFlow.git
cd TaskFlow
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

Refer to the [OAuth Setup Guide](oauth-setup-guide.md) for instructions on obtaining GitHub and Facebook OAuth credentials.

### 4. Start the Development Server

Run the following command to start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### 5. Run the Server with Socket.IO

To enable real-time updates, start the custom server:

```bash
node server.js
```

### 6. Build for Production

To build the application for production, run:

```bash
pnpm build
```

Then, start the production server:

```bash
pnpm start
```

## Usage

1. Open the application in your browser at `http://localhost:3000`.
2. Register or log in using GitHub or Facebook.
3. Create tasks, assign them to users, and manage their statuses.
4. View and update your profile, including uploading an avatar.
5. Use the dashboard to monitor tasks and their progress.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
- [Lucide Icons](https://lucide.dev/)

## Contact

For any questions or feedback, feel free to reach out to the repository owner.
