# Setting Up OAuth Providers for TaskFlow

This guide will help you set up GitHub and Facebook authentication for your TaskFlow application.

## GitHub OAuth Setup

1. Go to your GitHub account settings: https://github.com/settings/profile
2. Navigate to "Developer settings" at the bottom of the left sidebar
3. Click on "OAuth Apps" and then "New OAuth App"
4. Fill in the following details:
   - **Application name**: TaskFlow
   - **Homepage URL**: http://localhost:3002
   - **Application description**: Real-time collaborative task management app
   - **Authorization callback URL**: http://localhost:3002/api/auth/callback/github
5. Click "Register application"
6. After registration, you'll see your Client ID
7. Generate a new client secret by clicking "Generate a new client secret"
8. Copy both values and add them to your `.env.local` file:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

## Facebook OAuth Setup

1. Go to Facebook Developers: https://developers.facebook.com/
2. Click "My Apps" and then "Create App"
3. Select "Consumer" as the app type and click "Next"
4. Fill in the app name (TaskFlow) and contact email, then click "Create App"
5. In your app dashboard, select "Add Product" and add "Facebook Login"
6. Click on "Settings" under "Facebook Login" in the sidebar
7. Add the following OAuth Redirect URIs:
   - http://localhost:3002/api/auth/callback/facebook
8. Save your changes
9. Go to "Basic" settings under "Settings" in the sidebar
10. You'll find your App ID and App Secret there
11. Copy these values to your `.env.local` file:
    ```
    FACEBOOK_CLIENT_ID=your_app_id
    FACEBOOK_CLIENT_SECRET=your_app_secret
    ```

## Important Notes

1. **Local Development**: The configurations above are for local development. For production, you'll need to update the URLs to your production domain.

2. **Facebook Privacy Policy**: Facebook requires a privacy policy URL for your app. You'll need this when you're ready to make your app public.

3. **GitHub Limitations**: When using GitHub OAuth, remember that not all GitHub users have a public email. Make sure your app can handle cases where the email might be missing.

4. **Testing**: After setup, test by clicking the GitHub and Facebook login buttons on your login page.

5. **Environment Variables**: Remember that after adding new environment variables, you'll need to restart your development server for the changes to take effect.

If you encounter any issues during the setup process, refer to the official documentation:
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login/) 