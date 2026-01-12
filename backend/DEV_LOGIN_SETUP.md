# ISRS Dev Login Setup

Quick and easy development login for ISRS admin portal.

## Usage

### Quick Login (Recommended)

```bash
# From the backend directory
./login aaron.kornbluth@gmail.com
```

### Full Command

```bash
node dev-login.js aaron.kornbluth@gmail.com
```

## Output

The script will output a magic link that looks like:

```
✅ Dev login token generated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 User: Aaron Kornbluth (aaron.kornbluth@gmail.com)
⏰ Expires: 12/16/2025, 1:26:37 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Magic Link (click to login):

   http://localhost:3000/auth/verify?token=abc123...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Click the magic link** and you'll be:
1. Authenticated on the backend (port 3000)
2. Given a secure HTTP-only session cookie
3. Redirected to the admin portal (port 8080)

## Token Details

- **Validity**: 15 minutes
- **One-time use**: Token becomes invalid after first use
- **Environment**: Automatically uses localhost in dev, production URLs in production

## Common Users

```bash
# Admin login
./login aaron.kornbluth@gmail.com

# Another user
./login another.user@example.com
```

## Troubleshooting

### "No user found with email"
The email doesn't exist in the database. Check:
```sql
SELECT user_email, first_name, last_name FROM attendee_profiles LIMIT 10;
```

### "User account is not active"
The user's account_status is not 'active'. Fix with:
```sql
UPDATE attendee_profiles SET account_status = 'active' WHERE user_email = 'your@email.com';
```

### Token expired
Tokens expire after 15 minutes. Just generate a new one:
```bash
./login your@email.com
```

## How It Works

1. Script connects to the database
2. Finds the user by email
3. Generates a secure random token
4. Creates a user_session record with the token
5. Outputs a magic link with the token
6. When you click the link:
   - Backend validates the token
   - Loads your roles and permissions
   - Creates a session cookie
   - Redirects you to the appropriate dashboard

## Production Usage

In production, the script automatically uses the production backend URL:
- Development: `http://localhost:3000`
- Production: `https://isrs-database-backend.onrender.com`

Set `BACKEND_URL` environment variable to override.

## Security Notes

- This script is for **development only**
- Never commit the generated tokens to git
- Tokens are single-use and time-limited
- Session cookies are HTTP-only and Secure (in production)
