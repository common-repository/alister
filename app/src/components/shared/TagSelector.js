import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import throttle from "lodash/throttle";

import "../../styles/shared/TagSelector.css";

export function TagSelector(props) {
  const { tags, onTagChange, isGroupSelector } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const handleValueChange = (v) => {
    onTagChange(v);
  };

  const fetchData = React.useMemo(
    () =>
      throttle((request, callback) => {
        getTags(request, callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;
    if (inputValue === "") {
      setOptions(tags ? [tags] : []);
      return undefined;
    }

    fetchData({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (tags) {
          newOptions = [tags];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [tags, inputValue, fetchData]);

  // Load tags
  const getTags = (input, callback) => {
    const response = fetch(
      alisterData.url +
        "?" +
        new URLSearchParams({
          action: "get_tags",
          input: input.input,
        }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        callback(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Autocomplete
      className="tag-selector"
      size="small"
      getOptionLabel={(option) => {
        return option.name;
      }}
      filterOptions={(x) => {
        return x.filter((x) => x?.name);
      }}
      noOptionsText={"tag not found"}
      options={options}
      multiple={true}
      autoComplete
      filterSelectedOptions
      includeInputInList
      value={tags}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options);
        handleValueChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      isOptionEqualToValue={(option, value) => {
        return option.term_id == value.term_id;
      }}
      renderInput={(params) => (
        <TextField sx={{ minHeight: 0 }} {...params} label="Tags" />
      )}
    />
  );
}
