import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import throttle from "lodash/throttle";

import "../../styles/shared/CategorySelector.css";

export function CategorySelector(props) {
  const { categories, onCategoryChange, isGroupSelector } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const handleValueChange = (v) => {
    onCategoryChange(v);
  };

  const fetchData = React.useMemo(
    () =>
      throttle((request, callback) => {
        getCategories(request, callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;
    if (inputValue === "") {
      setOptions(categories ? [categories] : []);
      return undefined;
    }

    fetchData({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (categories) {
          newOptions = [categories];
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
  }, [categories, inputValue, fetchData]);

  // Load categories
  const getCategories = (input, callback) => {
    const response = fetch(
      alisterData.url +
        "?" +
        new URLSearchParams({
          action: "get_categories",
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
      className="category-selector"
      size="small"
      getOptionLabel={(option) => {
        return option.tree;
      }}
      filterOptions={(x) => {
        return x.filter((x) => x?.name);
      }}
      noOptionsText={"category not found"}
      options={options}
      multiple={true}
      autoComplete
      filterSelectedOptions
      includeInputInList
      value={categories}
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
        <TextField sx={{ minHeight: 0 }} {...params} label="Categories" />
      )}
    />
  );
}
