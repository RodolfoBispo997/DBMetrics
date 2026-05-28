"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const node_crypto_1 = require("node:crypto");
const user_role_enum_1 = require("../enums/user-role.enum");
const invalid_name_error_1 = require("../errors/invalid-name-error");
const invalid_email_error_1 = require("../errors/invalid-email-error");
const password_required_error_1 = require("../errors/password-required-error");
class User {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        const name = this.validateAndNormalizeName(props.name);
        const email = this.validateAndNormalizeEmail(props.email);
        const password = this.validatePassword(props.password);
        return new User({
            id: (0, node_crypto_1.randomUUID)(),
            name: name,
            email: email,
            password: password,
            role: props.role ?? user_role_enum_1.UserRole.ADMIN,
        });
    }
    static validateAndNormalizeName(name) {
        const normalized = name.trim().replace(/\s+/g, " ");
        if (!normalized.trim()) {
            throw new invalid_name_error_1.InvalidNameError("Name can't not be empty");
        }
        if (normalized.length < 2) {
            throw new invalid_name_error_1.InvalidNameError("Name too short");
        }
        if (normalized.length > 120) {
            throw new invalid_name_error_1.InvalidNameError("Name too long");
        }
        const valid = /^[\p{L}\p{M}' -]+$/u.test(normalized);
        if (!valid) {
            throw new invalid_name_error_1.InvalidNameError("Invalid characters in name");
        }
        return normalized;
    }
    static validateAndNormalizeEmail(email) {
        const normalizedEmail = email.trim();
        if (!normalizedEmail) {
            throw new invalid_email_error_1.InvalidEmailError("Email is required");
        }
        if (normalizedEmail.length > 254) {
            throw new invalid_email_error_1.InvalidEmailError("Invalid email");
        }
        const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
        if (!isValidFormat) {
            throw new invalid_email_error_1.InvalidEmailError("Invalid format");
        }
        return normalizedEmail.toLowerCase();
    }
    changeName(name) {
        const normalizedName = User.validateAndNormalizeName(name);
        this.props.name = normalizedName;
    }
    changePassword(password) {
        if (!password) {
            throw new password_required_error_1.PasswordRequiredError("Password required");
        }
        this.props.password = password;
    }
    static validatePassword(password) {
        const normalizedPassword = password?.trim();
        if (!normalizedPassword) {
            throw new password_required_error_1.PasswordRequiredError("Password required");
        }
        if (normalizedPassword.length < 8) {
            throw new password_required_error_1.PasswordRequiredError("Password too short");
        }
        return normalizedPassword;
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get email() {
        return this.props.email;
    }
    get role() {
        return this.props.role;
    }
    get password() {
        return this.props.password;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map