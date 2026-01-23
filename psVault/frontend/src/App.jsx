import { useState, useEffect } from "react";
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
} from "lucide-react";
import apiClient from "./utils/api/client.js";
import {
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
} from "./ui/style.jsx";
import socket, { connectSocket } from "./utils/socket.js";

import ListingCard from "./COMPONENTS/listing/ListingCard.jsx";
import AuthModal from "./COMPONENTS/auth/AuthModal.jsx";
import PostAdModal from "./COMPONENTS/listing/PostAdModal.jsx";
import ListingDetailModal from "./COMPONENTS/listing/ListingDetailModal.jsx";
import ChatPanel from "./COMPONENTS/chat/ChatPanel.jsx";
import MyListingsPanel from "./COMPONENTS/listing/MyListingsPanel.jsx";
import MessagesPanel from "./COMPONENTS/chat/MessagesPanel.jsx";

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postAdModalOpen, setPostAdModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [sidePanelView, setSidePanelView] = useState("none");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedChatListing, setSelectedChatListing] = useState(null);
  const [pendingChatListing, setPendingChatListing] = useState(null);

  const [accessToken, setAccessToken] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [userName, setUserName] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("All");
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (accessToken) connectSocket();

    const onConnect = () => console.log("🟢 SOCKET CONNECTED:", socket.id);
    const onConnectError = (err) =>
      console.log("🔴 SOCKET ERROR:", err.message);

    const onNewMessage = (msg) => {
      const user = apiClient.getCurrentUser();
      if (!user) return;

      if (msg.senderEmail !== user.email) {
        setHasUnread(true);
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("newMessage", onNewMessage);
    };
  }, [accessToken]);

  useEffect(() => {
    const initializeApp = async () => {
      await checkSession();
      await loadListings();
    };

    initializeApp();
  }, []);

  const checkSession = async () => {
    try {
      const user = apiClient.getCurrentUser();
      const token = window.localStorage.getItem("psvault-auth-token");

      if (user && token) {
        setAccessToken(token);
        setUserEmail(user.email);
        setUserName(user.name || "User");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getListings();
      setListings(data);
    } catch (err) {
      console.error("Error loading listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (token, email, name) => {
    setAccessToken(token);
    setUserEmail(email);
    setUserName(name);

    if (pendingChatListing) {
      setSelectedChatListing(pendingChatListing);
      setSidePanelView("chat");
      setDetailModalOpen(false);
      setPendingChatListing(null);
    }
  };

  const handleLogout = async () => {
    await apiClient.signOut();
    setAccessToken("");
    setUserEmail("");
    setUserName("");
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setDetailModalOpen(true);
  };

  const handleChatClick = () => {
    if (!accessToken) {
      setPendingChatListing(selectedListing);
      setDetailModalOpen(false);
      setAuthModalOpen(true);
    } else {
      setDetailModalOpen(false);
      setSelectedChatListing(selectedListing);
      setSidePanelView("chat");
    }
  };

  const isOwnListing = (listing) => {
    const user = apiClient.getCurrentUser();
    if (!user) return false;
    return listing.email === user.email;
  };

  const filteredAndSortedListings = (listings || [])
    .filter((listing) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (listing.title || "").toLowerCase();
        const description = (listing.description || "").toLowerCase();

        if (!title.includes(query) && !description.includes(query)) {
          return false;
        }
      }

      if (platformFilter !== "All") {
        if (listing.platform !== platformFilter) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === "price-high") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  return (
    <AppContainer>
      <BackgroundEffects>
        <BackgroundBlur />
        <BackgroundBlur />
      </BackgroundEffects>

      <Nav>
        <NavContainer>
          <NavContent>
            <Logo>
              <LogoIcon>
                <Gamepad2 size={32} style={{ color: "white" }} />
              </LogoIcon>
              <LogoText>
                <h1>
                  PS<span>VAULT</span>
                </h1>
                <p>Trade PlayStation Games</p>
              </LogoText>
            </Logo>

            <NavActions>
              {accessToken ? (
                <>
                  <SecondaryButton
                    onClick={() =>
                      setSidePanelView(
                        sidePanelView === "messages" ? "none" : "messages"
                      )
                    }
                    $active={sidePanelView === "messages"}
                    $color="#00d9ff"
                  >
                    <MessageSquare size={18} />
                    {hasUnread && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          width: "10px",
                          height: "10px",
                          background: "#00d9ff",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                    <span style={{ display: "none" }}>Messages</span>
                    <span style={{ display: "inline" }} className="md-show">
                      Messages
                    </span>
                  </SecondaryButton>

                  <SecondaryButton
                    onClick={() =>
                      setSidePanelView(
                        sidePanelView === "listings" ? "none" : "listings"
                      )
                    }
                    $active={sidePanelView === "listings"}
                    $color="#ff006e"
                  >
                    <Package size={18} />
                    <span style={{ display: "none" }}>My Listings</span>
                    <span style={{ display: "inline" }} className="md-show">
                      My Listings
                    </span>
                  </SecondaryButton>

                  <PrimaryButton onClick={() => setPostAdModalOpen(true)}>
                    <Plus size={20} />
                    <span style={{ display: "inline" }} className="sm-show">
                      Post Game
                    </span>
                  </PrimaryButton>

                  <UserInfo>
                    <User size={18} style={{ color: "#8b5cf6" }} />
                    <span>{userName}</span>
                  </UserInfo>

                  <IconButton onClick={handleLogout} title="Logout">
                    <LogOut size={18} />
                  </IconButton>
                </>
              ) : (
                <PrimaryButton onClick={() => setAuthModalOpen(true)}>
                  <LogIn size={20} />
                  Sign In
                </PrimaryButton>
              )}
            </NavActions>
          </NavContent>
        </NavContainer>
      </Nav>

      <MainContent>
        <ContentArea $panelOpen={sidePanelView !== "none"}>
          <Hero>
            <HeroContainer>
              <HeroContent>
                <h2>
                  The Ultimate PlayStation
                  <br />
                  <span className="gradient-text">Game Marketplace</span>
                </h2>
                <p>
                  Buy, sell, and trade PlayStation games with gamers worldwide.
                  Every listing verified by AI.
                </p>
                {!accessToken && (
                  <PrimaryButton
                    onClick={() => setAuthModalOpen(true)}
                    style={{ padding: "1rem 2rem" }}
                  >
                    Get Started Now
                  </PrimaryButton>
                )}
              </HeroContent>
            </HeroContainer>
          </Hero>

          <Section>
            <SearchSection>
              <SearchContainer>
                <SearchWrapper>
                  <SearchInputContainer>
                    <SearchIconWrapper>
                      <Search size={22} style={{ color: "#00d9ff" }} />
                    </SearchIconWrapper>
                    <SearchInput
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for games... (e.g., God of War, Spider-Man)"
                    />
                    {searchQuery && (
                      <ClearButton
                        onClick={() => setSearchQuery("")}
                        title="Clear search"
                      >
                        <X size={18} />
                      </ClearButton>
                    )}
                  </SearchInputContainer>
                </SearchWrapper>

                <DropdownWrapper>
                  <DropdownButton
                    onClick={() =>
                      setPlatformDropdownOpen(!platformDropdownOpen)
                    }
                    $color="#8b5cf6"
                    $open={platformDropdownOpen}
                  >
                    <Filter size={16} />
                    <span>{platformFilter}</span>
                    <svg
                      style={{ width: "12px", height: "12px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </DropdownButton>

                  {platformDropdownOpen && (
                    <>
                      <Backdrop
                        onClick={() => setPlatformDropdownOpen(false)}
                      />

                      <DropdownMenu $color="#8b5cf6" $width="128px">
                        {["All", "PS5", "PS4"].map((platform, index) => (
                          <div key={platform}>
                            {index > 0 && (
                              <div
                                style={{
                                  height: "1px",
                                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                                }}
                              ></div>
                            )}
                            <DropdownItem
                              onClick={() => {
                                setPlatformFilter(platform);
                                setPlatformDropdownOpen(false);
                              }}
                              $active={platformFilter === platform}
                              $color="#8b5cf6"
                            >
                              {platform}
                            </DropdownItem>
                          </div>
                        ))}
                      </DropdownMenu>
                    </>
                  )}
                </DropdownWrapper>

                <DropdownWrapper>
                  <DropdownButton
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    $color="#ff006e"
                    $open={sortDropdownOpen}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {sortBy === "price-low" ? (
                        <ArrowUp size={16} />
                      ) : sortBy === "price-high" ? (
                        <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                      <span>
                        {sortBy === "none"
                          ? "Default"
                          : sortBy === "price-low"
                            ? "Low to High"
                            : "High to Low"}
                      </span>
                    </div>
                    <svg
                      style={{ width: "12px", height: "12px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </DropdownButton>

                  {sortDropdownOpen && (
                    <>
                      <Backdrop onClick={() => setSortDropdownOpen(false)} />

                      <DropdownMenu $color="#ff006e" $width="160px">
                        {[
                          { value: "none", label: "Default" },
                          { value: "price-low", label: "Low to High" },
                          { value: "price-high", label: "High to Low" },
                        ].map((option, index) => (
                          <div key={option.value}>
                            {index > 0 && (
                              <div
                                style={{
                                  height: "1px",
                                  backgroundColor: "rgba(255, 0, 110, 0.2)",
                                }}
                              ></div>
                            )}
                            <DropdownItem
                              onClick={() => {
                                setSortBy(option.value);
                                setSortDropdownOpen(false);
                              }}
                              $active={sortBy === option.value}
                              $color="#ff006e"
                            >
                              {option.label}
                            </DropdownItem>
                          </div>
                        ))}
                      </DropdownMenu>
                    </>
                  )}
                </DropdownWrapper>
              </SearchContainer>

              {(searchQuery || platformFilter !== "All") && (
                <SearchResultInfo>
                  {filteredAndSortedListings.length === 0
                    ? "No games found matching your filters"
                    : `Found ${
                        filteredAndSortedListings.filter((l) => !l.isSold)
                          .length
                      } game${
                        filteredAndSortedListings.filter((l) => !l.isSold)
                          .length !== 1
                          ? "s"
                          : ""
                      }`}
                  {platformFilter !== "All" && ` for ${platformFilter}`}
                </SearchResultInfo>
              )}
            </SearchSection>

            <SectionHeader>
              <div>
                <h3>Available Games</h3>
                <p>Browse verified PlayStation game listings</p>
              </div>
            </SectionHeader>

            {loading ? (
              <LoadingContainer>
                <div>
                  <Spinner />
                  <span>Loading games...</span>
                </div>
              </LoadingContainer>
            ) : filteredAndSortedListings.length === 0 ? (
              <EmptyState>
                <Gamepad2 size={64} />
                {searchQuery || platformFilter !== "All" ? (
                  <>
                    <p>
                      No games found{" "}
                      {searchQuery && `matching "${searchQuery}"`}
                      {searchQuery && platformFilter !== "All" && " "}
                      {platformFilter !== "All" && `for ${platformFilter}`}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setPlatformFilter("All");
                      }}
                    >
                      Clear filters and view all games
                    </button>
                  </>
                ) : (
                  <>
                    <p>No listings yet. Be the first to post!</p>
                    {accessToken && (
                      <PrimaryButton onClick={() => setPostAdModalOpen(true)}>
                        Post Your First Game
                      </PrimaryButton>
                    )}
                  </>
                )}
              </EmptyState>
            ) : (
              <>
                {filteredAndSortedListings.filter((l) => !l.isSold).length >
                  0 && (
                  <Grid>
                    {filteredAndSortedListings
                      .filter((l) => !l.isSold)
                      .map((listing) => (
                        <ListingCard
                          key={listing.listingId}
                          listing={listing}
                          onClick={() => handleListingClick(listing)}
                          isOwnListing={isOwnListing(listing)}
                        />
                      ))}
                  </Grid>
                )}

                {filteredAndSortedListings.filter((l) => l.isSold).length > 0 &&
                  searchQuery === "" && (
                    <SoldSection>
                      <SoldDivider>
                        <div></div>
                        <h4>Sold Items</h4>
                        <div></div>
                      </SoldDivider>
                      <SoldGrid>
                        {filteredAndSortedListings
                          .filter((l) => l.isSold)
                          .map((listing) => (
                            <ListingCard
                              key={listing.listingId}
                              listing={listing}
                              onClick={() => handleListingClick(listing)}
                              isOwnListing={isOwnListing(listing)}
                            />
                          ))}
                      </SoldGrid>
                    </SoldSection>
                  )}
              </>
            )}
          </Section>

          <Footer>
            <FooterContainer>
              <FooterContent>
                <div>
                  <Gamepad2 size={24} style={{ color: "#00d9ff" }} />
                  <span>PSVAULT - PlayStation Game Marketplace</span>
                </div>
                <p>AI-Verified Listings</p>
              </FooterContent>
            </FooterContainer>
          </Footer>
        </ContentArea>

        <SidePanel $open={sidePanelView !== "none"}>
          {sidePanelView === "messages" && accessToken && (
            <MessagesPanel
              onClose={() => setSidePanelView("none")}
              email={userEmail}
              onChatOpen={async (listingId) => {
                try {
                  const listing = await apiClient.getListingById(listingId);

                  if (!listing) {
                    console.error("Listing not found:", listingId);
                    return;
                  }

                  setSelectedChatListing(listing);
                  setSidePanelView("chat");
                } catch (err) {
                  console.error("Failed to fetch listing:", err);
                }
              }}
              setHasUnread={setHasUnread}
            />
          )}

          {sidePanelView === "listings" && accessToken && (
            <MyListingsPanel
              onClose={() => setSidePanelView("none")}
              accessToken={accessToken}
              email={userEmail}
              onListingDeleted={loadListings}
            />
          )}

          {sidePanelView === "chat" && selectedChatListing && accessToken && (
            <ChatPanel
              onClose={() => setSidePanelView("messages")}
              listing={selectedChatListing}
              currentUserEmail={userEmail}
              currentUserName={userName}
            />
          )}
        </SidePanel>
      </MainContent>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuth}
      />

      {accessToken && (
        <PostAdModal
          isOpen={postAdModalOpen}
          onClose={() => setPostAdModalOpen(false)}
          accessToken={accessToken}
          onSuccess={() => {
            loadListings();
            setPostAdModalOpen(false);
          }}
        />
      )}

      {selectedListing && (
        <ListingDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          listing={selectedListing}
          onChatClick={handleChatClick}
          isOwnListing={isOwnListing(selectedListing)}
          currentUserEmail={userEmail}
        />
      )}
    </AppContainer>
  );
}
