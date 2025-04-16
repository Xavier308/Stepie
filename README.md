
*(See detailed structure tree below)*

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (LTS version recommended - e.g., v18, v20, v22)
*   npm (comes with Node.js)
*   A "NoBackend" service or custom API endpoint configured to interact with a MySQL database, providing RESTful endpoints for:
    *   Weight Entries (GET all, POST new, PATCH/PUT update, DELETE)
    *   Goals (GET current, PUT/PATCH update)

### Installation & Setup

1.  **Clone the repository (or set up your local project folder):**
    ```bash
    # If using Git:
    # git clone <your-repository-url>
    # cd stepie-app

    # If starting fresh based on provided code:
    # Navigate to your project directory
    cd path/to/your/stepie-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Endpoint:**
    *   Open the `src/services/apiService.js` file.
    *   Replace the placeholder `'YOUR_NOBACKEND_API_URL'` with the actual base URL of your NoBackend service API.
    *   If your API requires authentication (e.g., API keys, bearer tokens), uncomment and configure the `headers` section within `apiService.js` according to your service's documentation.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode with hot reloading.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the project files using ESLint.
*   `npm run preview`: Serves the production build locally for testing.

## Future Enhancements

*   Implement detailed management for "Additional Goals".
*   Integrate user authentication.
*   Develop gamification features (challenges, points, leaderboards).
*   Add social features for sharing progress with friends.
*   Implement unit and integration tests.
*   Add internationalization (i18n) support (e.g., units kg/lbs).