function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
    }

    // Support flat array or rest parameters
    const rolesList = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

    if (!rolesList.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of the following roles: [${rolesList.join(', ')}]. Current role: '${req.user.role}'`
      });
    }

    next();
  };
}

module.exports = authorizeRoles;
