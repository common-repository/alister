import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

export const ImagePopover = (props) => {
  const imageSource = props.imageSource;
  const imageWidth = props.imageWidth;
  const popoverImageWidth = props.popoverImageWidth;
  const index = props.index;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <img
        aria-owns={open ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        src={imageSource}
        width={imageWidth}
        style={
          index == "0"
            ? { border: "4px solid #D0DB7A" }
            : { }
        }
      ></img>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>
          <img src={imageSource} width={popoverImageWidth}></img>
        </Typography>
      </Popover>
    </>
  );
}
