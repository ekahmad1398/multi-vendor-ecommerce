// `user` and `seller` were the original stored values.  Keep accepting them
// while old databases are migrated, but expose one application vocabulary.
const legacyRoleMap = { user: "customer", seller: "vendor" };

export const normalizeRole = (role) => legacyRoleMap[role] || role;

export const roleQueryValues = (role) => {
  if (role === "customer") return ["customer", "user"];
  if (role === "vendor") return ["vendor", "seller"];
  return [role];
};

export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  sellerStatus: user.sellerStatus,
  isEmailVerified: user.isEmailVerified,
});
