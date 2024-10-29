import React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import TranslateIcon from "@mui/icons-material/Translate";
import { Tooltip } from "@mui/material";

import SortFilterTable from "../../shared/SortFilterTable";

import "../../../styles/Importer/GroupModifier/PropertyDictionary.css";

const DeleteAction = (props) => {
  const handleDelete = props.onAction;
  const deleteArgs = props.actionArgs;
  const disabled = props.disabled;
  return (
    <IconButton
      color="primary_ultimus"
      disabled={disabled}
      onClick={(event) => handleDelete(...deleteArgs)}
    >
      <DeleteIcon />
    </IconButton>
  );
};

export const PropertyDictionary = (props) => {
  const {
    onTranslateProperties,
    dictionary,
    onRefreshOptions,
    openSnackBar,
    isProductSelected,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [dictKey, setDictKey] = React.useState("");
  const [dictValue, setDictValue] = React.useState("");
  const [requestInProgress, setRequestInProgress] = React.useState(false);

  const [filterText, setFilterText] = React.useState("");

  const handleFilterTextChange = (event) => {
    setFilterText(event.target.value);
  };

  const filter = (rows) => {
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        value.toLowerCase().includes(filterText.toLowerCase())
      )
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const addToDictionary = async () => {
    if (dictKey && dictValue) {
      setRequestInProgress(true);
      const response = await fetch(alisterData.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          action: "alister_set_option",
          name: "property_dictionary",
          original: dictKey,
          translation: dictValue,
        }),
      });

      if (!response.ok) {
        openSnackBar(
          `Could not save entry. Reason: ${response.statusText}`,
          "error"
        );
      }
      setRequestInProgress(false);
      onRefreshOptions();
    }
  };

  const deleteEntry = async (key) => {
    setRequestInProgress(true);
    const response = await fetch(alisterData.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "alister_delete_property_dict",
        key,
      }),
    });

    if (!response.ok) {
      openSnackBar(
        `Could not delete the term: ${response.statusText}`,
        "error"
      );
    } else {
      onRefreshOptions();
    }
    setRequestInProgress(false);
  };

  const dictHeaders = [
    {
      id: "original",
      numeric: false,
      label: "Original",
      width: "",
    },
    { id: "translation", numeric: false, label: "Translation", width: "auto" },
    {
      id: "deleteEntry",
      isAction: true,
      numeric: false,
      label: "",
      width: "",
    },
  ];

  const dictRows = Object.keys(dictionary).map((key) => {
    return { original: key, translation: dictionary[key] };
  });

  const actionDict = {
    deleteEntry: {
      actionComponent: DeleteAction,
      handleAction: deleteEntry,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        color="primary_ultimus"
        variant="contained"
        className="property-transform-button"
        onClick={onTranslateProperties}
        style={{ marginRight: 10 }}
        disabled={!isProductSelected}
      >
        Translate
      </Button>
      <Tooltip title="Create a translation dictionary to teach alister what product properties should be automatically translated (e.g. “Red” - “Rot”)">
        <IconButton
          color="primary_ultimus"
          onClick={(event) => handleClickOpen()}
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Dictionary</span>{" "}
            <input
              type="text"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => handleFilterTextChange(e)}
              style={{
                width: "35%",
                marginLeft: "auto",
                marginRight: "2%",
                maxHeight: 35,
                marginTop: 5
              }}
            ></input>
          </span>
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <SortFilterTable
              headers={dictHeaders}
              rows={filter(dictRows)}
              requestInProgress={requestInProgress}
              actionDict={actionDict}
              actionArgIds={["original"]}
              rowsPerPageOptions={[10, 15, 30]}
              maxTableHeight="300px"
            ></SortFilterTable>
          </div>
        </DialogContent>
        <DialogActions>
          <span style={{ marginBottom: 20 }}>
            <input
              type="text"
              value={dictKey}
              onChange={(e) => setDictKey(e.target.value)}
              placeholder="Original"
              style={{ marginRight: 10 }}
            ></input>
            <input
              type="text"
              value={dictValue}
              onChange={(e) => setDictValue(e.target.value)}
              placeholder="Translated"
            ></input>
            <IconButton
              color="primary_ultimus"
              disabled={!(dictKey && dictValue) || requestInProgress}
              onClick={(event) => addToDictionary()}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </span>
        </DialogActions>
      </Dialog>
    </div>
  );
};
