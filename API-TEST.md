# 🔍 API ENDPOINTS TEST

## Backend URL: https://food-recipes-2-u6ck.onrender.com

### Available Endpoints:
✅ **GET /** - Status**: Working
  - Response: "Recipe Sharing Backend Running"

### Authentication Routes (/auth):
- **POST /auth/register** - User registration
- **POST /auth/login** - User login  
- **POST /auth/logout** - User logout
- **POST /auth/forgotpassword** - Forgot password

### Recipe Routes (/auth):
- **GET /auth/recipe** - Get all recipes (requires token)
- **POST /auth/recipe** - Create recipe (requires token)
- **PUT /auth/recipe/:id** - Update recipe (requires token)
- **DELETE /auth/recipe/:id** - Delete recipe (requires token)
- **GET /auth/likedRecipes** - Get liked recipes (requires token)
- **POST /auth/likedRecipes/:id** - Like recipe (requires token)
- **DELETE /auth/removeLiked/:id** - Remove from liked (requires token)
- **GET /auth/searchRecipes/:key** - Search recipes (public)

### 404 Error Possible Causes:
1. **Missing Token**: Frontend not sending authorization header
2. **Wrong Endpoint**: Typo in API URL
3. **CORS Issue**: Frontend URL not in allowed origins
4. **Route Not Found**: Endpoint doesn't exist

### Quick Tests:
```bash
# Test backend status
curl https://food-recipes-2-u6ck.onrender.com/

# Test protected route (should return 401 without token)
curl https://food-recipes-2-u6ck.onrender.com/auth/recipe

# Test with token (replace YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://food-recipes-2-u6ck.onrender.com/auth/recipe
```

### Next Steps:
1. Deploy frontend with updated API URL
2. Check browser console for specific 404 errors
3. Verify token is being sent in headers
4. Test each endpoint individually
