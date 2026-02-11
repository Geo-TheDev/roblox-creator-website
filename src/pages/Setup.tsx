import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  RocketLaunch,
  Delete,
} from "@mui/icons-material";
import type { AppState } from "../types";
import { getSessions, saveSession, deleteSession } from "../sessions";

interface Props {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function Setup({ appState, setAppState }: Props) {
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(appState.apiKey);
  const [universeId, setUniverseId] = useState(appState.universeId);
  const [experienceName, setExperienceName] = useState(appState.experienceName);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState(getSessions);

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    if (!universeId.trim() || isNaN(Number(universeId))) {
      setError("A valid Universe ID is required.");
      return;
    }
    setError("");

    const name = experienceName.trim() || `Universe ${universeId.trim()}`;
    saveSession({
      apiKey: apiKey.trim(),
      universeId: universeId.trim(),
      experienceName: name,
    });

    setAppState({
      apiKey: apiKey.trim(),
      universeId: universeId.trim(),
      experienceName: name,
    });
    navigate("/dashboard");
  };

  const handleSessionClick = (session: (typeof sessions)[0]) => {
    saveSession({
      apiKey: session.apiKey,
      universeId: session.universeId,
      experienceName: session.experienceName,
    });
    setAppState({
      apiKey: session.apiKey,
      universeId: session.universeId,
      experienceName: session.experienceName,
    });
    navigate("/dashboard");
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          py: 4,
        }}
      >
        <Typography variant="h3" fontWeight={700} textAlign="center">
          Roblox Universe Manager
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Bulk manage gamepasses and developer products for your experiences.
        </Typography>

        {sessions.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Sessions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {sessions.map((s) => (
                <Card key={s.id} variant="outlined">
                  <Box sx={{ display: "flex", alignItems: "stretch" }}>
                    <CardActionArea onClick={() => handleSessionClick(s)} sx={{ flex: 1 }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {s.experienceName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Universe {s.universeId} &middot;{" "}
                          {new Date(s.lastUsed).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSession(s.id)}
                      sx={{ alignSelf: "center", mx: 1 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
            <Divider sx={{ mt: 3, mb: 1 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              Or connect a new experience below
            </Typography>
          </Paper>
        )}

        <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="h6">Connect your experience</Typography>

          <TextField
            label="Open Cloud API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type={showKey ? "text" : "password"}
            fullWidth
            helperText="Create one at create.roblox.com → Credentials → API Keys"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                      {showKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Universe ID"
            value={universeId}
            onChange={(e) => setUniverseId(e.target.value)}
            fullWidth
            helperText="Found in your game's settings on the Creator Dashboard"
          />

          <TextField
            label="Experience Name (optional)"
            value={experienceName}
            onChange={(e) => setExperienceName(e.target.value)}
            fullWidth
            helperText="A friendly label so you know which game you're editing"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            size="large"
            startIcon={<RocketLaunch />}
            onClick={handleSubmit}
            sx={{ mt: 1 }}
          >
            Launch Manager
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
