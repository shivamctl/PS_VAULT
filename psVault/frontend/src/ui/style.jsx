import styled, { keyframes } from "styled-components";
import {
  Gamepad2,
  Plus,
  LogIn,
  LogOut,
  User,
  Package,
  MessageSquare,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  DollarSign,
  CheckCircle,
  Clock,
  Images,
  Send,
  ImagePlus,
  Trash2,
  MessageCircle,
} from "lucide-react";
// import apiClient from "../utils/api/client.js ";

// ===== STYLED COMPONENTS =====

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #0a0e1a;
`;

const BackgroundEffects = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const BackgroundBlur = styled.div`
  position: absolute;
  width: 384px;
  height: 384px;
  border-radius: 50%;
  filter: blur(96px);
  animation: ${pulse} 3s ease-in-out infinite;

  &:first-child {
    top: 0;
    left: 25%;
    background-color: rgba(0, 217, 255, 0.1);
  }

  &:last-child {
    bottom: 0;
    right: 25%;
    background-color: rgba(255, 0, 110, 0.1);
    animation-delay: 1s;
  }
`;

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  background-color: rgba(15, 20, 25, 0.8);
  backdrop-filter: blur(16px);
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled.div`
  padding: 0.5rem;
  background: linear-gradient(to bottom right, #00d9ff, #ff006e);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.div`
  h1 {
    color: white;
    letter-spacing: -0.025em;
    font-size: 1.5rem;
    margin: 0;

    span {
      color: #00d9ff;
    }
  }

  p {
    color: #9ca3af;
    font-size: 0.75rem;
    margin: 0;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 640px) {
    gap: 0.75rem;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 640px) {
    padding: 0.625rem 1.25rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(to right, #00d9ff, #ff006e);
  color: white;

  &:hover:not(:disabled) {
    box-shadow: 0 10px 15px -3px rgba(0, 217, 255, 0.5);
    transform: scale(1.05);
  }
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(to right, #1a2236, #0f1419);
  border: 1px solid
    ${(props) => (props.$active ? props.$color : `${props.$color}33`)};
  color: ${(props) => props.$color};

  ${(props) =>
    props.$active &&
    `
    box-shadow: 0 10px 15px -3px ${props.$color}4D;
  `}

  &:hover {
    border-color: ${(props) => props.$color};
    box-shadow: 0 10px 15px -3px ${(props) => props.$color}4D;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      ${(props) => props.$color}00,
      ${(props) => props.$color}1A,
      ${(props) => props.$color}00
    );
    transform: translateX(-100%);
    transition: transform 0.7s;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  span,
  svg {
    position: relative;
    z-index: 1;
  }
`;

const IconButton = styled.button`
  padding: 0.625rem;
  color: #9ca3af;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ef4444;
    background-color: #1a2236;
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

const UserInfo = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(to right, #1a2236, #0f1419);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;

  @media (min-width: 640px) {
    display: flex;
  }

  span {
    color: white;
    font-size: 0.875rem;
    display: none;

    @media (min-width: 1024px) {
      display: inline;
    }
  }
`;

const Hero = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #1a2236, #0a0e1a);
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
`;

const HeroContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 1rem;

  @media (min-width: 640px) {
    padding: 4rem 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 4rem 2rem;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 768px;
  margin: 0 auto;

  h2 {
    color: white;
    margin-bottom: 1rem;
    font-size: 2.25rem;
    line-height: 1.2;

    @media (min-width: 768px) {
      font-size: 3rem;
    }
  }

  .gradient-text {
    background: linear-gradient(to right, #00d9ff, #8b5cf6, #ff006e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: #9ca3af;
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  position: relative;
`;

const ContentArea = styled.div`
  flex: 1;
  transition: margin-right 0.3s;
  margin-right: ${(props) => (props.$panelOpen ? "0" : "0")};

  @media (min-width: 1024px) {
    margin-right: ${(props) => (props.$panelOpen ? "500px" : "0")};
  }
`;

const Section = styled.div`
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1rem;

  @media (min-width: 640px) {
    padding: 3rem 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem 2rem;
  }
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  max-width: 1024px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;

  &:focus-within::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #00d9ff, #8b5cf6, #ff006e);
    border-radius: 0.75rem;
    opacity: 1;
    filter: blur(4px);
    transition: opacity 0.3s;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #00d9ff, #8b5cf6, #ff006e);
    border-radius: 0.75rem;
    opacity: 0;
    filter: blur(4px);
    transition: opacity 0.3s;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #1a2236, #0f1419);
  border: 2px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s;

  &:focus-within {
    border-color: #00d9ff;
  }
`;

const SearchIconWrapper = styled.div`
  padding-left: 1.25rem;
  padding-right: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  color: white;
  padding: 1rem 1rem 1rem 0;
  outline: none;
  border: none;

  &::placeholder {
    color: #6b7280;
  }
`;

const ClearButton = styled.button`
  margin-right: 0.75rem;
  padding: 0.375rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff006e;
    background-color: rgba(255, 0, 110, 0.1);
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
  width: auto;
`;

const DropdownButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(to right, #1a2236, #0f1419);
  border: 2px solid ${(props) => props.$color}33;
  border-radius: 0.75rem;
  transition: all 0.3s;
  padding: 0.75rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: ${(props) => props.$color};
  }

  span {
    color: white;
    font-size: 0.875rem;
  }

  svg {
    color: ${(props) => props.$color};
    transition: transform 0.2s;

    ${(props) =>
      props.$open &&
      `
      transform: rotate(180deg);
    `}
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  width: ${(props) => props.$width || "160px"};
  background-color: #1a2236;
  border: 2px solid ${(props) => props.$color}66;
  border-radius: 0.75rem;
  overflow: hidden;
  z-index: 20;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? `${props.$color}33` : "transparent"};
  color: ${(props) => (props.$active ? props.$color : "#d1d5db")};

  &:hover {
    background-color: ${(props) => props.$color}1A;
    color: white;
  }

  & + & {
    border-top: 1px solid ${(props) => props.$color}33;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
`;

const SearchResultInfo = styled.p`
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;

  div {
    h3 {
      color: white;
      margin-bottom: 0.5rem;
    }

    p {
      color: #9ca3af;
      margin: 0;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-center;
  padding: 5rem 0;
  
  div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #00d9ff;
  }
`;

const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 4px solid #00d9ff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5rem 0;

  svg {
    color: #4b5563;
    margin: 0 auto 1rem;
  }

  p {
    color: #9ca3af;
    margin-bottom: 1rem;
  }

  button {
    color: #00d9ff;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #ff006e;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const SoldSection = styled.div`
  margin-top: 4rem;
`;

const SoldDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  div {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, #374151, transparent);
  }

  h4 {
    color: #9ca3af;
    margin: 0;
  }
`;

const SoldGrid = styled(Grid)`
  opacity: 0.6;
`;

const Footer = styled.footer`
  position: relative;
  border-top: 1px solid rgba(0, 217, 255, 0.2);
  background-color: rgba(15, 20, 25, 0.8);
  backdrop-filter: blur(16px);
  margin-top: 5rem;
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: 640px) {
    padding: 2rem 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem 2rem;
  }
`;

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      color: #9ca3af;
    }
  }

  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
`;

const SidePanel = styled.div`
  position: fixed;
  top: 80px;
  right: 0;
  height: calc(100vh - 80px);
  width: 100%;
  background: linear-gradient(to bottom right, #1a2236, #0f1419);
  border-left: 2px solid rgba(0, 217, 255, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: translateX(${(props) => (props.$open ? "0" : "100%")});
  transition: transform 0.3s;
  z-index: 30;
  overflow-y: auto;

  @media (min-width: 1024px) {
    width: 500px;
  }
`;

// Modal Overlay
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  padding: 1rem;
`;

const Modal = styled.div`
  position: relative;
  width: 100%;
  max-width: ${(props) => props.$maxWidth || "28rem"};
  background: linear-gradient(to bottom right, #1a2236, #0f1419);
  border: 2px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 217, 255, 0.2);
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    color: white;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;

  h2 {
    color: #00d9ff;
    margin-bottom: 0.5rem;
  }

  p {
    color: #9ca3af;
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    color: #d1d5db;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
`;

const Input = styled.input`
  width: 100%;
  background-color: #0a0e1a;
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  color: white;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #00d9ff;
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background-color: #0a0e1a;
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  color: white;
  outline: none;
  transition: border-color 0.3s;
  resize: vertical;
  min-height: 100px;

  &:focus {
    border-color: #00d9ff;
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const Select = styled.select`
  width: 100%;
  background-color: #0a0e1a;
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  color: white;
  outline: none;
  transition: border-color 0.3s;
  cursor: pointer;

  &:focus {
    border-color: #00d9ff;
  }

  option {
    background-color: #0a0e1a;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  color: #fca5a5;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  color: #6ee7b7;
  font-size: 0.875rem;
`;

const LinkButton = styled.button`
  color: #00d9ff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  text-align: center;
  padding: 0.5rem;

  &:hover {
    color: #ff006e;
  }
`;

// Card Styles
const Card = styled.div`
  position: relative;
  background: linear-gradient(to bottom right, #1a2236, #0f1419);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #00d9ff;
    box-shadow: 0 20px 25px -5px rgba(0, 217, 255, 0.2);
  }

  &:hover .card-image {
    transform: scale(1.1);
  }

  &:hover .card-title {
    color: #00d9ff;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    border: 2px solid #00d9ff;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const CardBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  background-color: #ff006e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const CardImage = styled.div`
  position: relative;
  height: 192px;
  overflow: hidden;
  background-color: #0a0e1a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #0a0e1a, transparent, transparent);
    opacity: 0.6;
  }

  .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      color: #6b7280;
      font-size: 0.875rem;
    }
  }
`;

const ImageCount = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ConditionBadge = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background-color: #8b5cf6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
`;

const CardContent = styled.div`
  padding: 1.25rem;

  h3 {
    color: white;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s;
  }

  .description {
    color: #9ca3af;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .price {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      span {
        color: white;
      }
    }

    .platform {
      padding: 0.25rem 0.5rem;
      background-color: rgba(0, 217, 255, 0.1);
      border: 1px solid rgba(0, 217, 255, 0.3);
      border-radius: 0.25rem;
      color: #00d9ff;
      font-size: 0.75rem;
    }
  }

  .footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 217, 255, 0.1);

    .footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      .seller {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .chat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #00d9ff;
        font-size: 0.875rem;
      }
    }

    .time {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #6b7280;
      font-size: 0.75rem;
    }
  }
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #0a0e1a;
  border: 2px dashed rgba(0, 217, 255, 0.3);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    text-align: center;
    color: #9ca3af;

    p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  background-color: #0a0e1a;
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #dc2626;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 150px;
  background-color: #0a0e1a;
  border: 2px dashed rgba(0, 217, 255, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #00d9ff;
    background-color: rgba(0, 217, 255, 0.05);
  }

  svg {
    color: #00d9ff;
    margin-bottom: 0.5rem;
  }

  span {
    color: #9ca3af;
    font-size: 0.875rem;
  }
`;

const VerificationStatus = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${(props) =>
    props.$status === "verifying" &&
    `
    background-color: rgba(59, 130, 246, 0.2);
    border: 1px solid #3b82f6;
    color: #93c5fd;
  `}

  ${(props) =>
    props.$status === "success" &&
    `
    background-color: rgba(16, 185, 129, 0.2);
    border: 1px solid #10b981;
    color: #6ee7b7;
  `}
  
  ${(props) =>
    props.$status === "error" &&
    `
    background-color: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
    color: #fca5a5;
  `}
  
  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }
`;

// Panel Components
const PanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    color: #00d9ff;
    margin: 0;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageItem = styled.div`
  padding: 1rem;
  background: linear-gradient(to bottom right, #1a2236, #0f1419);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #00d9ff;
    box-shadow: 0 4px 6px -1px rgba(0, 217, 255, 0.1);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;

    h4 {
      color: white;
      margin: 0;
      font-size: 1rem;
    }

    span {
      color: #6b7280;
      font-size: 0.75rem;
    }
  }

  .preview {
    color: #9ca3af;
    font-size: 0.875rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isOwn ? "flex-end" : "flex-start")};

  .sender {
    color: #9ca3af;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .bubble {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background-color: ${(props) => (props.$isOwn ? "#00d9ff" : "#1a2236")};
    color: ${(props) => (props.$isOwn ? "#0a0e1a" : "white")};
    word-wrap: break-word;

    ${(props) =>
      props.$isOwn &&
      `
      border-bottom-right-radius: 0.25rem;
    `}

    ${(props) =>
      !props.$isOwn &&
      `
      border-bottom-left-radius: 0.25rem;
    `}
  }

  .time {
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
`;

const ChatInputContainer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 217, 255, 0.2);
`;

const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 9999px;
  color: #00d9ff;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(0, 217, 255, 0.2);
    border-color: #00d9ff;
  }
`;

const ChatInputForm = styled.form`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    background-color: #0a0e1a;
    border: 1px solid rgba(0, 217, 255, 0.3);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    color: white;
    outline: none;

    &:focus {
      border-color: #00d9ff;
    }
  }

  button {
    background-color: #00d9ff;
    color: #0a0e1a;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #00c4e6;
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const ListingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListingItem = styled.div`
  padding: 1rem;
  background: linear-gradient(to bottom right, #1a2236, #0f1419);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 0.5rem;

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;

    h4 {
      color: white;
      margin: 0;
      font-size: 1rem;
      flex: 1;
    }
  }

  .info {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #9ca3af;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;

    span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const SmallButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;

  ${(props) =>
    props.$variant === "danger" &&
    `
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
    
    &:hover {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
    }
  `}

  ${(props) =>
    props.$variant === "success" &&
    `
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
    
    &:hover {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
    }
  `}
`;

const DetailModalContainer = styled(Modal)`
  max-width: 800px;
  padding: 0;
`;

const DetailModalContent = styled.div`
  .image-section {
    position: relative;
    height: 400px;
    background-color: #0a0e1a;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
    }
  }

  .content {
    padding: 2rem;

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;

      h2 {
        color: white;
        margin: 0;
        flex: 1;
      }
    }

    .price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #00d9ff;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      span {
        padding: 0.5rem 1rem;
        background-color: rgba(0, 217, 255, 0.1);
        border: 1px solid rgba(0, 217, 255, 0.3);
        border-radius: 0.5rem;
        color: #00d9ff;
        font-size: 0.875rem;
      }
    }

    .description {
      color: #d1d5db;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: rgba(0, 217, 255, 0.05);
      border-radius: 0.5rem;
    }

    .seller-info {
      padding: 1rem;
      background-color: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;

      p {
        color: #d1d5db;
        margin: 0;

        strong {
          color: #8b5cf6;
        }
      }
    }
  }
`;

const ImageGallery = styled.div`
  position: relative;
  height: 400px;
  background-color: #0a0e1a;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #00d9ff;
      color: #0a0e1a;
    }

    &.prev {
      left: 1rem;
    }

    &.next {
      right: 1rem;
    }
  }

  .dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;

    button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background-color: #00d9ff;
        width: 24px;
        border-radius: 4px;
      }
    }
  }
`;

export {
  pulse,
  spin,
  shimmer,
  AppContainer,
  BackgroundEffects,
  BackgroundBlur,
  Nav,
  NavContainer,
  NavContent,
  Logo,
  LogoIcon,
  LogoText,
  NavActions,
  Button,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  UserInfo,
  Hero,
  HeroContainer,
  HeroContent,
  MainContent,
  ContentArea,
  Section,
  SearchSection,
  SearchContainer,
  SearchWrapper,
  SearchInputContainer,
  SearchIconWrapper,
  SearchInput,
  ClearButton,
  DropdownWrapper,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  Backdrop,
  SearchResultInfo,
  SectionHeader,
  LoadingContainer,
  Spinner,
  EmptyState,
  Grid,
  SoldSection,
  SoldDivider,
  SoldGrid,
  Footer,
  FooterContainer,
  FooterContent,
  SidePanel,
  ModalOverlay,
  Modal,
  CloseButton,
  ModalHeader,
  Form,
  FormGroup,
  Input,
  TextArea,
  Select,
  ErrorMessage,
  SuccessMessage,
  LinkButton,
  Card,
  CardBadge,
  CardImage,
  ImageCount,
  ConditionBadge,
  CardContent,
  ImagePreview,
  ImagesGrid,
  ImageItem,
  RemoveImageButton,
  FileInput,
  FileInputLabel,
  VerificationStatus,
  PanelContainer,
  PanelHeader,
  PanelContent,
  MessageList,
  MessageItem,
  ChatContainer,
  ChatMessages,
  ChatMessage,
  ChatInputContainer,
  QuickActions,
  QuickActionButton,
  ChatInputForm,
  ListingsList,
  ListingItem,
  SmallButton,
  DetailModalContainer,
  DetailModalContent,
  ImageGallery,
};
