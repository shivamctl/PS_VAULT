import { useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../utils/api/client.js";
import {
  ModalOverlay,
  Modal,
  CloseButton,
  ModalHeader,
  Form,
  FormGroup,
  Input,
  ErrorMessage,
  PrimaryButton,
  LinkButton,
} from "../../ui/style.jsx";

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiClient.signUp(email, password, name);
      onAuthSuccess(data.token, data.user.email, data.user.name);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiClient.signIn(email, password);
      onAuthSuccess(data.token, data.user.email, data.user.name);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <ModalHeader>
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p>
            {isSignUp ? "Join the PS CD marketplace" : "Sign in to continue"}
          </p>
        </ModalHeader>

        <Form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {isSignUp && (
            <FormGroup>
              <label>Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormGroup>
          )}

          <FormGroup>
            <label>Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <PrimaryButton
            type="submit"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </PrimaryButton>
        </Form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <LinkButton
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </LinkButton>
        </div>
      </Modal>
    </ModalOverlay>
  );
}

export default AuthModal;
