import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  ConfirmationNumber,
  ShoppingCart,
  ArrowBack,
} from "@mui/icons-material";
import type { AppState } from "../types";
import Gamepasses from "./Gamepasses";
import DeveloperProducts from "./DeveloperProducts";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Gamepasses", icon: <ConfirmationNumber />, path: "/dashboard/gamepasses" },
  { label: "Developer Products", icon: <ShoppingCart />, path: "/dashboard/developer-products" },
];

interface Props {
  appState: AppState;
  onBack: () => void;
}

export default function Dashboard({ appState, onBack }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {appState.experienceName}
          </Typography>
          <Typography variant="body2" color="inherit" sx={{ opacity: 0.7 }}>
            Universe {appState.universeId}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route index element={<Placeholder />} />
          <Route path="gamepasses" element={<Gamepasses appState={appState} />} />
          <Route path="developer-products" element={<DeveloperProducts appState={appState} />} />
        </Routes>
      </Box>
    </Box>
  );
}

function Placeholder() {
  return (
    <Box sx={{ textAlign: "center", mt: 10, opacity: 0.5 }}>
      <Typography variant="h5">
        Select Gamepasses or Developer Products from the sidebar to get started.
      </Typography>
    </Box>
  );
}
