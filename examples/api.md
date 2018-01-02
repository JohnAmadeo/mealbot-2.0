# POST /user
## Create a new user account
curl -H "Content-Type: application/json" --data '{"user_id": "d70650ca-d413-4ab4-8ce3-2fc0025459ce", "email": "john.amadeo@example.com"}' http://0.0.0.0:5000/user

# GET /user?email={email}
## Fetch user data (& check if user exists)
curl http://0.0.0.0:5000/user?email=john.amadeo@example.com