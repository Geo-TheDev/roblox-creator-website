import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

interface Props {
  name: string;
  description?: string;
  price: number;
  isForSale: boolean;
  iconUrl?: string;
  onEdit: () => void;
}

export default function ItemCard({
  name,
  description,
  price,
  isForSale,
  iconUrl,
  onEdit,
}: Props) {
  return (
    <Card variant="outlined" sx={{ display: "flex", alignItems: "center" }}>
      {iconUrl ? (
        <CardMedia
          component="img"
          sx={{ width: 80, height: 80, objectFit: "cover", m: 1.5, borderRadius: 1 }}
          image={iconUrl}
          alt={name}
        />
      ) : (
        <Box
          sx={{
            width: 80,
            height: 80,
            m: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            No icon
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {name}
          </Typography>
          <Chip
            label={isForSale ? "On Sale" : "Off Sale"}
            size="small"
            color={isForSale ? "success" : "default"}
            variant="outlined"
          />
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {description}
          </Typography>
        )}
        <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
          R$ {price.toLocaleString()}
        </Typography>
      </CardContent>
      <IconButton onClick={onEdit} sx={{ mr: 2 }}>
        <Edit />
      </IconButton>
    </Card>
  );
}
