import React, { useState, useEffect } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import "../../../styles/Importer/ProductEditor/TextEditor.css";


export function TextEditor(props) {
  const {
    openSnackBar,
    onRefreshDescriptionTemplates,
    productDescription,
    onDescriptionChange,
    productId,
  } = props;

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [open, setOpen] = React.useState(false);

  const [templateName, setTemplateName] = React.useState("");
  const [savingTemplate, setSavingTemplate] = React.useState(false);

  function onStateChange(editorState) {
    setEditorState(editorState);
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveTemplate = async (name, template) => {
    setSavingTemplate(true);
    try {
      const data = {
        type: "POST",
        url: alisterData.url,
        data: {
          action: "alister_add_description_template",
          name,
          template,
        },
      };
      const response = await jQuery.ajax(data);

      if (!response) {
        throw new Error(`Error! failed to save template ${name}`);
      }
      openSnackBar(`Template saved: ${name}`, "success");
    } catch (err) {
      openSnackBar(`Error: ${err.statusText}`, "error");
    } finally {
      setSavingTemplate(false);
    }
    onRefreshDescriptionTemplates();
  };

  useEffect(() => {
    const contentBlock = htmlToDraft(productDescription);
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks
    );
    setEditorState(EditorState.createWithContent(contentState));
  }, [props.productDescription]);

  return (
    <div style={{ width: "100%" }}>
      <Editor
        editorState={editorState}
        onEditorStateChange={onStateChange}
        onBlur={() =>
          onDescriptionChange(
            productId,
            draftToHtml(convertToRaw(editorState.getCurrentContent()))
          )
        }
        toolbar={editorOptions}
        wrapperClassName="text-editor-wrapper"
        editorClassName="editor-wrapper"
        toolbarCustomButtons={[
          <Tooltip title="Save the current description as a template">
            <IconButton
              aria-label="delete"
              onClick={handleClickOpen}
              style={{ marginLeft: "auto", marginBottom: 10 }}
              color="primary_ultimus"
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>,
        ]}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Description Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Current description text will be saved as a template. In order to
            automatically insert important data inside your templates use these
            variables: <br /> &#123;&#123;title&#125;&#125; -
            &#123;&#123;price&#125;&#125;
          </DialogContentText>
          <input
            type="text"
            className="custom-input generic-background-color"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ width: "100%", marginTop: 20 }}
          ></input>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={savingTemplate}
            variant="outlined"
            color="primary_ultimus"
            onClick={(event) =>
              handleSaveTemplate(
                templateName,
                draftToHtml(convertToRaw(editorState.getCurrentContent()))
              )
            }
          >
            Save Template
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const editorOptions = {
  options: ["blockType", "inline", "list"],
  inline: {
    options: ["bold", "italic", "underline"],
  },
  blockType: {
    options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6"],
  },
};
