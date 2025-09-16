import React, {useState} from "react";
import {useNavigate} from "@tanstack/react-router";
import {
    encryptData,
    decryptData,
    hashPassword,
    comparePassword,
} from "../../../utils/crypto";
import Button from "../buttons/Button";
import "./LoginPage.css";
import {InfoIcon} from "../../icons/icons";
import ReusableModal from "../modal/ReusableModal";

interface User {
    username: string;
    password: string;
    userType: string;
    company: string;
}

interface FormFields {
    username: string;
    password: string;
    rePassword: string;
    userType: string;
    company: string;
}

const USER_STORAGE_KEY = "users";

interface LoginPageProps {
    returnTo?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({returnTo}) => {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormFields>({
        username: "",
        password: "",
        rePassword: "",
        userType: "Vendor",
        company: "",
    });
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormFields, string>>
    >({});
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({
        message: "",
        visible: false,
    });

    // Forgot password modal state
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotForm, setForgotForm] = useState<{ username: string; password: string; rePassword: string }>({
        username: "",
        password: "",
        rePassword: "",
    });
    const [forgotError, setForgotError] = useState<string | null>(null);

    const resetForm = () => {
        setForm({
            username: "",
            password: "",
            rePassword: "",
            userType: "Vendor",
            company: "",
        });
        setErrors({});
        setError(null);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const validateField = (name: string, value: string): string => {
        if (name === "username") {
            if (!value) return "Username/Email is required";
            const encryptedUsers = localStorage.getItem(USER_STORAGE_KEY);
            let users: User[] = [];
            if (encryptedUsers) {
                try {
                    users = JSON.parse(decryptData(encryptedUsers));
                } catch {
                    console.log("Decryption failed");
                }
            }
            if (isRegistering && users.find((u: User) => u.username === value)) {
                return "Username/Email already exists";
            }
        }
        if (name === "company" && !value) return "Company is required";
        if (name === "password") {
            const pwErrors = validatePassword(value);
            if (pwErrors.length)
                return "Password must be strong: " + pwErrors.join(", ");
        }
        if (name === "rePassword") {
            if (value !== form.password) return "Passwords do not match";
        }
        return "";
    };

    const validatePassword = (password: string) => {
        const pwErrors: string[] = [];
        if (password.length < 8) pwErrors.push("At least 8 characters");
        if (!/[A-Z]/.test(password)) pwErrors.push("At least one uppercase letter");
        if (!/[a-z]/.test(password)) pwErrors.push("At least one lowercase letter");
        if (!/[0-9]/.test(password)) pwErrors.push("At least one digit");
        if (!/[^A-Za-z0-9]/.test(password))
            pwErrors.push("At least one special character");
        return pwErrors;
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        const errorMsg = validateField(name, value);
        setErrors((prev) => ({...prev, [name]: errorMsg}));
    };

    const handleLogin = () => {
        const encryptedUsers = localStorage.getItem(USER_STORAGE_KEY);
        let users: User[] = [];
        if (encryptedUsers) {
            try {
                users = JSON.parse(decryptData(encryptedUsers));
            } catch {
                console.log("Decryption failed");
            }
        }
        const user = users.find(
            (u: User) =>
                u.username === form.username &&
                comparePassword(form.password, u.password)
        );
        if (user) {
            setError(null);
            setErrors({});
            setToast({message: "User successfully logged in", visible: true});
            localStorage.setItem("loggedInUser", encryptData(user));
            setTimeout(() => {
                setToast({message: "", visible: false});
                const safeTarget =
                    returnTo && returnTo.startsWith("/") ? returnTo : "/tickets";
                navigate({to: safeTarget as any});
            }, 750);
        } else {
            setError("Invalid credentials");
        }
    };

    const handleRegister = () => {
        let valid = true;
        const newErrors: Partial<Record<keyof FormFields, string>> = {};
        (
            ["username", "password", "rePassword", "company"] as (keyof FormFields)[]
        ).forEach((field) => {
            const errorMsg = validateField(field, form[field] || "");
            if (errorMsg) {
                valid = false;
                newErrors[field] = errorMsg;
            }
        });
        setErrors(newErrors);
        if (!valid) return;
        const encryptedUsers = localStorage.getItem(USER_STORAGE_KEY);
        let users: User[] = [];
        if (encryptedUsers) {
            try {
                users = JSON.parse(decryptData(encryptedUsers));
            } catch {
                console.log("Decryption failed");
            }
        }
        const newUser: User = {
            username: form.username,
            password: hashPassword(form.password),
            userType: form.userType,
            company: form.company,
        };
        users.push(newUser);
        localStorage.setItem(USER_STORAGE_KEY, encryptData(users));
        setError(null);
        setErrors({});
        setToast({message: "User successfully Registered", visible: true});
        resetForm();
        setIsRegistering(false);
        setTimeout(() => {
            setToast({message: "", visible: false});
        }, 750);
    };

    // Forgot password handlers
    const openForgot = () => {
        setForgotForm({
            username: form.username || "",
            password: "",
            rePassword: "",
        });
        setForgotError(null);
        setForgotOpen(true);
    };

    const handleForgotSave = () => {
        const username = forgotForm.username.trim();
        if (!username) {
            setForgotError("Username/Email is required");
            return;
        }
        // reuse validatePassword
        const pwIssues = validatePassword(forgotForm.password);
        if (pwIssues.length) {
            setForgotError("Password must be strong: " + pwIssues.join(", "));
            return;
        }
        if (forgotForm.password !== forgotForm.rePassword) {
            setForgotError("Passwords do not match");
            return;
        }
        const encryptedUsers = localStorage.getItem(USER_STORAGE_KEY);
        let users: User[] = [];
        if (encryptedUsers) {
            try {
                users = JSON.parse(decryptData(encryptedUsers));
            } catch {
                setForgotError("Failed to read users store");
                return;
            }
        }
        const idx = users.findIndex((u) => u.username === username);
        if (idx === -1) {
            setForgotError("User not found");
            return;
        }
        users[idx] = {...users[idx], password: hashPassword(forgotForm.password)};
        try {
            localStorage.setItem(USER_STORAGE_KEY, encryptData(users));
            setForgotOpen(false);
            setToast({message: "Password reset successfully", visible: true});
            setTimeout(() => setToast({message: "", visible: false}), 1000);
        } catch {
            setForgotError("Failed to update password");
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-page-left">
                <div>
                    <h1>Welcome to Sky Ticketing</h1>
                    <p>Manage your tickets efficiently and securely.</p>
                </div>
            </div>
            <div className="login-page-right">
                <img src={"/skyworld_logo_small.png"} alt={"Sky Logo"}/>
                <p className={"header"}>{isRegistering ? "Welcome create account" : "Welcome Back"}</p>
                <div className="login-content">
                    {toast.visible && (
                        <div className="toast-notification">{toast.message}</div>
                    )}
                    <label htmlFor="username">Username/Email</label>
                    <div className={"input-container"}>
                        <input
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.username ? "input-error" : ""}
                        />
                        <span
                            className={errors.username ? "info-icon error" : "info-icon"}
                        >
              <InfoIcon/>
            </span>
                    </div>
                    {errors.username && (
                        <span className="error-message">{errors.username}</span>
                    )}

                    <label htmlFor="password">Password</label>
                    <div className={"input-container"}>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoComplete={"off"}
                            className={errors.password ? "input-error" : ""}

                        />
                        <span
                            className={errors.username ? "info-icon error" : "info-icon"}
                        >
              <InfoIcon/>
            </span>
                    </div>

                    {isRegistering && (
                        <>
                            <label htmlFor="rePassword">Repeat Password</label>
                            <div className={"input-container"}>
                                <input
                                    name="rePassword"
                                    type="password"
                                    placeholder="Repeat Password"
                                    value={form.rePassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete={"off"}
                                    className={errors.rePassword ? "input-error" : ""}

                                />
                                <span
                                    className={errors.username ? "info-icon error" : "info-icon"}
                                >
                  <InfoIcon/>
                </span>
                            </div>
                            {errors.rePassword && (
                                <span className="error-message">{errors.rePassword}</span>
                            )}

                            <label htmlFor="userType">System User Type</label>
                            <select
                                name="userType"
                                value={form.userType}
                                onChange={handleChange}
                            >
                                <option value="Vendor">Vendor</option>
                                <option value="Client">Client</option>
                            </select>

                            <label htmlFor="company">Company</label>
                            <div className={"input-container"}>
                                <input
                                    name="company"
                                    type="text"
                                    placeholder="Company"
                                    value={form.company}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.company ? "input-error" : ""}
                                />
                                <span
                                    className={errors.username ? "info-icon error" : "info-icon"}
                                >
                  <InfoIcon/>
                </span>
                            </div>
                            {errors.company && (
                                <span className="error-message">{errors.company}</span>
                            )}
                        </>
                    )}

                    {error && <div className="error">{error}</div>}

                    <Button
                        onClick={isRegistering ? handleRegister : handleLogin}
                        variant="primary"
                    >
                        {isRegistering ? "Register" : "Login"}
                    </Button>

                    <Button
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            resetForm();
                        }}
                        variant="secondary"
                    >
                        {isRegistering ? "Back to Login" : "Create Account"}
                    </Button>

                    {/* Forgot/Reset links placed below the action buttons */}
                    <div className="forgot-reset-links">
                        <button
                            type="button"
                            onClick={openForgot}
                        >
                            Forgot password?
                        </button>
                        <button
                            type="button"
                            onClick={openForgot}
                        >
                            Reset Password
                        </button>
                    </div>

                    {errors.password && (
                        <span className="error-message">{errors.password}</span>
                    )}
                </div>
            </div>

            <ReusableModal
                isOpen={forgotOpen}
                onClose={() => setForgotOpen(false)}
                title="Reset Password"
                titleIcon={<InfoIcon/>}
                footerButtons={
                    <>
                        <button onClick={() => setForgotOpen(false)} className="secondary">Cancel</button>
                        <button onClick={handleForgotSave}>Save</button>
                    </>
                }
            >
                <div className={"register-container"}>
                    {forgotError && <div className="error">{forgotError}</div>}
                    <label>Username/Email</label>
                    <input
                        type="text"
                        value={forgotForm.username}
                        onChange={(e) => setForgotForm((s) => ({...s, username: e.target.value}))}
                        placeholder="Enter your username/email"
                    />
                    <label>New Password</label>
                    <input
                        type="password"
                        value={forgotForm.password}
                        onChange={(e) => setForgotForm((s) => ({...s, password: e.target.value}))}
                        placeholder="Enter new password"
                    />
                    <label>Repeat New Password</label>
                    <input
                        type="password"
                        value={forgotForm.rePassword}
                        onChange={(e) => setForgotForm((s) => ({...s, rePassword: e.target.value}))}
                        placeholder="Repeat new password"
                    />
                </div>
            </ReusableModal>
        </div>
    );
};

export default LoginPage;
