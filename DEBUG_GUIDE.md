# 🐛 ATLAS Concierge - Debug Guide

## Quick Start

### Option 1: VS Code Debug Panel (Recommended)

1. **Open Debug Panel**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)

2. **Select Configuration**:
   - `Debug NestJS Backend` - Debug backend only
   - `Debug Frontend (Vite)` - Debug frontend only
   - `Full Stack Debug` - Debug both simultaneously
   - `Debug Tests` - Debug Jest tests

3. **Start Debugging**: Press `F5` or click the green play button

4. **Set Breakpoints**: Click to the left of line numbers in any `.ts` file

### Option 2: Manual Terminal Commands

```bash
# Setup (first time only)
chmod +x debug-setup.sh
./debug-setup.sh

# Start Docker services
cd backend-nestjs
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start backend with watch mode
npm run start:dev

# In another terminal - Start frontend
cd ..
npm run dev
```

## 🔍 Debug Features

### Backend Debug Configuration

**File**: `.vscode/launch.json`

**Features**:
- ✅ Auto-restart on file changes
- ✅ Source maps enabled
- ✅ Skip node internals
- ✅ Integrated terminal
- ✅ Port 9229 for debugging

**Breakpoint Tips**:
- Set breakpoints in controllers, services, or middleware
- Use `debugger;` statement for programmatic breakpoints
- Inspect variables in Debug sidebar
- Use Debug Console for REPL

### Environment Variables

**File**: `backend-nestjs/.env`

Key variables for debugging:
```bash
NODE_ENV=development
LOG_LEVEL=debug           # Verbose logging
LOG_FORMAT=simple         # Human-readable logs
PORT=4000                 # Backend port
```

## 📊 Debugging Tools

### 1. Prisma Studio (Database GUI)
```bash
cd backend-nestjs
npm run prisma:studio
```
Opens at: http://localhost:5555

**Features**:
- View all database tables
- Edit records directly
- Run queries
- See relationships

### 2. Swagger API Documentation
After starting backend: http://localhost:4000/api

**Features**:
- Test all API endpoints
- See request/response schemas
- Try authentication
- View examples

### 3. Health Check
http://localhost:4000/health
http://localhost:4000/health/detailed

**Shows**:
- Server status
- Database connectivity
- Memory usage
- Uptime

### 4. Winston Logs
Logs written to:
- `backend-nestjs/logs/combined.log` - All logs
- `backend-nestjs/logs/error.log` - Errors only
- Console - Real-time output

## 🔧 Common Debug Scenarios

### Debugging Authentication Issues

**Set breakpoints in**:
- `backend-nestjs/src/modules/auth/auth.service.ts` - Login logic
- `backend-nestjs/src/modules/auth/strategies/jwt.strategy.ts` - JWT validation
- `backend-nestjs/src/common/guards/` - Guard execution

**Debug Console Commands**:
```javascript
// Check JWT payload
console.log(decoded)

// Inspect user object
console.log(user)
```

### Debugging API Requests

**Set breakpoints in**:
- Controllers (`*.controller.ts`) - Request entry
- Services (`*.service.ts`) - Business logic
- `src/common/interceptors/` - Request/response transformation

**Watch Variables**:
- `req.user` - Current authenticated user
- `req.headers` - Request headers
- `body` - Request payload

### Debugging Database Queries

**Set breakpoints in**:
- Service methods calling Prisma
- `src/common/prisma/prisma.service.ts` - Query logging

**Enable Prisma Query Logging**:
Edit `prisma.service.ts`:
```typescript
super({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});
```

### Debugging WebSocket Events

**Set breakpoints in**:
- `backend-nestjs/src/modules/realtime/realtime.gateway.ts`
- `handleConnection()` - Client connects
- `handleDisconnect()` - Client disconnects
- Event handlers

**Debug Console**:
```javascript
// See connected clients
console.log(this.connectedClients)

// Check room memberships
console.log(this.server.sockets.adapter.rooms)
```

## 🧪 Debug Tests

### Run Tests with Debugging

**VS Code**: Select "Debug Tests" configuration and press F5

**Terminal**:
```bash
cd backend-nestjs
npm run test:debug
```

**Set breakpoints in**:
- `*.spec.ts` files
- The actual implementation being tested

### Watch Mode
```bash
npm run test:watch
```

## 📱 Frontend Debugging

### Browser DevTools

1. Start frontend: `npm run dev`
2. Open: http://localhost:5173
3. Press F12 for DevTools

**React DevTools Extension**: Install for component inspection

### Debug Configuration

**VS Code**: "Debug Frontend (Vite)" configuration

**Features**:
- Set breakpoints in `.tsx` files
- Inspect component state
- Track prop changes

### Common Frontend Issues

**API Connection**:
- Check CORS settings in backend
- Verify API URL in frontend code
- Check Network tab in browser DevTools

**State Management**:
- Add breakpoints in `context/Store.tsx`
- Log state changes
- Use React DevTools

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or change PORT in .env
```

### Database Connection Failed
```bash
# Check Docker containers
docker ps

# Restart PostgreSQL
cd backend-nestjs
docker-compose restart postgres

# Check connection string
echo $DATABASE_URL
```

### TypeScript Compilation Errors
```bash
# Rebuild
cd backend-nestjs
npm run build

# Generate Prisma Client
npx prisma generate
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend-nestjs
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

### Log Files
```bash
# Watch logs in real-time
tail -f backend-nestjs/logs/combined.log

# Search for errors
grep -i error backend-nestjs/logs/combined.log
```

### Database Inspection
```bash
# Connect to PostgreSQL directly
docker exec -it atlas-postgres psql -U atlas -d atlas_dev

# Common queries
\dt                    # List tables
SELECT * FROM users;   # Query users
\d+ rides             # Describe rides table
```

### Performance Profiling

**Backend**:
```bash
# Start with profiling
node --prof dist/main.js

# Generate profile report
node --prof-process isolate-*-v8.log > profile.txt
```

**Frontend**:
- Use React DevTools Profiler
- Chrome DevTools Performance tab
- Network tab for API timing

## 🎯 Debug Checklist

Before starting debug session:

- [ ] Docker services running (`docker ps`)
- [ ] Database migrated (`npx prisma migrate dev`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Environment variables set (`.env` file exists)
- [ ] Dependencies installed (`node_modules` exists)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] No port conflicts (4000, 5432, 6379, 5173)

## 💡 Pro Tips

1. **Use Watch Mode**: `npm run start:dev` auto-reloads on changes
2. **Prisma Studio**: Keep it open for quick database inspection
3. **Swagger UI**: Test endpoints before writing frontend code
4. **Log Everything**: Use `logger.debug()` liberally during development
5. **Conditional Breakpoints**: Right-click breakpoint → Edit breakpoint
6. **Debug Console**: Execute code in current scope
7. **Call Stack**: Use to trace execution flow
8. **Variable Watch**: Add variables to Watch panel

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `backend-nestjs/logs/error.log`
2. Check database: Prisma Studio
3. Check API: Swagger UI at `/api`
4. Check network: Browser DevTools
5. Check environment: `.env` file
6. Check services: `docker ps`

---

**Ready to debug!** Press F5 and start developing. 🚀
