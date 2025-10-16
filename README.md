# Qatu Marketplace Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![Built with Express](https://img.shields.io/badge/Built%20with-Express-blue)](http://expressjs.com/)

This repository contains the backend source code for Qatu, a digital marketplace built with Node.js, Express, and Sequelize, following the principles of Clean Architecture.

---


## Tech Stack

*   **Node.js**: JavaScript runtime environment.
*   **Express**: Web framework for building the REST API.
*   **Sequelize**: ORM for PostgreSQL database interaction.
*   **PostgreSQL**: Relational database.
*   **Dotenv**: For environment variable management.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following software installed:

*   [Node.js](https://nodejs.org/) (v18.x or higher is recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**

    You can clone the repository using either HTTPS or SSH.

    *   **Using HTTPS:**
        ```bash
        git clone https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SB/group-1/backend.git
        ```

    *   **Using SSH:**
        ```bash
        git clone git@gitlab.com:jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SB/group-1/backend.git
        ```

2.  **Navigate to the project directory**
    ```bash
    cd backend
    ```

3.  **Install dependencies**
    ```bash
    npm install
    ```

4.  **Set up environment variables**

    Create a `.env` file in the root of the project. You can copy the `.env.example` file (if it exists) as a template. This file will hold database credentials and other sensitive settings.

    ```ini
    # Database Configuration
    DB_USER=your_postgres_user
    DB_PASSWORD=your_password
    DB_NAME=value
    DB_HOST=value
    DB_PORT=value

    # App Configuration
    PORT=calue
    NODE_ENV=value
    ```

## Usage

Once the installation is complete, you can start the server in different modes.

*   **Development Mode:**
    This command uses `nodemon` to automatically restart the server whenever a file change is detected.
    ```bash
    npm run dev
    ```

*   **Production Mode:**
    This command starts the server in a standard way.
    ```bash
    npm start
    ```

Upon starting, you should see a confirmation message in the console that the database connection was successful and the API is listening on the specified port.


## 📄 License

This project is licensed under the MIT License.
