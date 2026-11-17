/**
 * Event emitter sederhana untuk koordinasi event autentikasi secara global
 * (misal penanganan 401 Unauthorized dan trigger auto logout).
 */

class AuthHandler {
  constructor() {
    this.listeners = {
      unauthorized: [],
      logout: [],
    };
  }

  on401(callback) {
    if (typeof callback === 'function') {
      this.listeners.unauthorized.push(callback);
    }
    return () => {
      this.listeners.unauthorized = this.listeners.unauthorized.filter((cb) => cb !== callback);
    };
  }

  onLogout(callback) {
    if (typeof callback === 'function') {
      this.listeners.logout.push(callback);
    }
    return () => {
      this.listeners.logout = this.listeners.logout.filter((cb) => cb !== callback);
    };
  }

  emit401() {
    this.listeners.unauthorized.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in on401 callback:', err);
      }
    });
  }

  emitLogout() {
    this.listeners.logout.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in onLogout callback:', err);
      }
    });
  }
}

const authHandler = new AuthHandler();
export default authHandler;
