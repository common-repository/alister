import React, { useState, useEffect, useRef } from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { colors } from "@mui/material";

import CustomSnackBar from "./components/shared/CustomSnackBar";
import { FilterManager } from "./components/FilterManager/FilterManager";
import { InventoryTable } from "./components/InventoryTable/InventoryTable";
import HelpDialog from "./components/shared/HelpDialog";
import { Importer } from "./components/Importer/Importer";
import {
  ImportListHelpContent,
  ManualImportHelpContent,
  setAlisterOption,
  getHashCode,
} from "./utlis";

// import { test } from "./testProduct";

import "./App.css";

const theme = createTheme({
  palette: {
    primary_ultimus: {
      main: colors.orange[500],
      contrastText: "#fff",
    },
    enabled_ultimus: {
      main: "#D0DB7A",
      contrastText: "#fff",
    },
    import_ultimus: {
      main: "#F84E0C",
      contrastText: "#fff",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

const wcKeys = [
  "name",
  "description",
  "sku",
  "image_urls",
  "categories",
  "attributes",
  "variations",
  "meta_data",
];
const aliKeys = [
  "title",
  "description",
  "productImages",
  "properties",
  "variations",
  "shipping",
  "productUrl",
];

const normalizeNames = {
  title: "name",
  description: "description",
  sku: "sku",
  image_urls: "images",
  productImages: "images",
  productUrl: "url",
  images: "images",
  categories: "categories",
  variations: "variations",
  shipping: "shipping",
  attributres: "properties",
  properties: "properties",
  meta_data: "meta",
};

const destinationCountries = [
  {
    id: "AF",
    name: "Afghanistan",
  },
  {
    id: "AL",
    name: "Albania",
  },
  {
    id: "DZ",
    name: "Algeria",
  },
  {
    id: "AS",
    name: "American Samoa",
  },
  {
    id: "AD",
    name: "Andorra",
  },
  {
    id: "AO",
    name: "Angola",
  },
  {
    id: "AI",
    name: "Anguilla",
  },
  {
    id: "AG",
    name: "Antigua and Barbuda",
  },
  {
    id: "AR",
    name: "Argentina",
  },
  {
    id: "AM",
    name: "Armenia",
  },
  {
    id: "AW",
    name: "Aruba",
  },
  {
    id: "AU",
    name: "Australia",
  },
  {
    id: "AT",
    name: "Austria",
  },
  {
    id: "AZ",
    name: "Azerbaijan",
  },
  {
    id: "BS",
    name: "Bahamas",
  },
  {
    id: "BH",
    name: "Bahrain",
  },
  {
    id: "BD",
    name: "Bangladesh",
  },
  {
    id: "BB",
    name: "Barbados",
  },
  {
    id: "BY",
    name: "Belarus",
  },
  {
    id: "BE",
    name: "Belgium",
  },
  {
    id: "BZ",
    name: "Belize",
  },
  {
    id: "BJ",
    name: "Benin",
  },
  {
    id: "BM",
    name: "Bermuda",
  },
  {
    id: "BT",
    name: "Bhutan",
  },
  {
    id: "BO",
    name: "Bolivia, Plurinational State of",
  },
  {
    id: "BQ",
    name: "Bonaire, Sint Eustatius and Saba",
  },
  {
    id: "BA",
    name: "Bosnia and Herzegovina",
  },
  {
    id: "BW",
    name: "Botswana",
  },
  {
    id: "BR",
    name: "Brazil",
  },
  {
    id: "BN",
    name: "Brunei Darussalam",
  },
  {
    id: "BG",
    name: "Bulgaria",
  },
  {
    id: "BF",
    name: "Burkina Faso",
  },
  {
    id: "BI",
    name: "Burundi",
  },
  {
    id: "CV",
    name: "Cabo Verde",
  },
  {
    id: "KH",
    name: "Cambodia",
  },
  {
    id: "CM",
    name: "Cameroon",
  },
  {
    id: "CA",
    name: "Canada",
  },
  {
    id: "KY",
    name: "Cayman Islands",
  },
  {
    id: "CF",
    name: "Central African Republic",
  },
  {
    id: "TD",
    name: "Chad",
  },
  {
    id: "CL",
    name: "Chile",
  },
  {
    id: "CX",
    name: "Christmas Island",
  },
  {
    id: "CC",
    name: "Cocos (Keeling) Islands",
  },
  {
    id: "CO",
    name: "Colombia",
  },
  {
    id: "KM",
    name: "Comoros",
  },
  {
    id: "CG",
    name: "Congo",
  },
  {
    id: "CK",
    name: "Cook Islands",
  },
  {
    id: "CR",
    name: "Costa Rica",
  },
  {
    id: "HR",
    name: "Croatia",
  },
  {
    id: "CW",
    name: "Cura\u00e7ao",
  },
  {
    id: "CY",
    name: "Cyprus",
  },
  {
    id: "CZ",
    name: "Czechia",
  },
  {
    id: "CI",
    name: "C\u00f4te d'Ivoire",
  },
  {
    id: "DK",
    name: "Denmark",
  },
  {
    id: "DJ",
    name: "Djibouti",
  },
  {
    id: "DM",
    name: "Dominica",
  },
  {
    id: "DO",
    name: "Dominican Republic",
  },
  {
    id: "EC",
    name: "Ecuador",
  },
  {
    id: "EG",
    name: "Egypt",
  },
  {
    id: "SV",
    name: "El Salvador",
  },
  {
    id: "GQ",
    name: "Equatorial Guinea",
  },
  {
    id: "ER",
    name: "Eritrea",
  },
  {
    id: "EE",
    name: "Estonia",
  },
  {
    id: "SZ",
    name: "Eswatini",
  },
  {
    id: "ET",
    name: "Ethiopia",
  },
  {
    id: "FK",
    name: "Falkland Islands (Malvinas)",
  },
  {
    id: "FO",
    name: "Faroe Islands",
  },
  {
    id: "FJ",
    name: "Fiji",
  },
  {
    id: "FI",
    name: "Finland",
  },
  {
    id: "FR",
    name: "France",
  },
  {
    id: "GF",
    name: "French Guiana",
  },
  {
    id: "PF",
    name: "French Polynesia",
  },
  {
    id: "GA",
    name: "Gabon",
  },
  {
    id: "GM",
    name: "Gambia",
  },
  {
    id: "GE",
    name: "Georgia",
  },
  {
    id: "DE",
    name: "Germany",
  },
  {
    id: "GH",
    name: "Ghana",
  },
  {
    id: "GI",
    name: "Gibraltar",
  },
  {
    id: "GR",
    name: "Greece",
  },
  {
    id: "GL",
    name: "Greenland",
  },
  {
    id: "GD",
    name: "Grenada",
  },
  {
    id: "GP",
    name: "Guadeloupe",
  },
  {
    id: "GU",
    name: "Guam",
  },
  {
    id: "GT",
    name: "Guatemala",
  },
  {
    id: "GGY",
    name: "Guernsey",
  },
  {
    id: "GN",
    name: "Guinea",
  },
  {
    id: "GW",
    name: "Guinea-Bissau",
  },
  {
    id: "GY",
    name: "Guyana",
  },
  {
    id: "HT",
    name: "Haiti",
  },
  {
    id: "VA",
    name: "Holy See (Vatican City State)",
  },
  {
    id: "HN",
    name: "Honduras",
  },
  {
    id: "HK",
    name: "Hong Kong",
  },
  {
    id: "HU",
    name: "Hungary",
  },
  {
    id: "IS",
    name: "Iceland",
  },
  {
    id: "IN",
    name: "India",
  },
  {
    id: "ID",
    name: "Indonesia",
  },
  {
    id: "IQ",
    name: "Iraq",
  },
  {
    id: "IE",
    name: "Ireland",
  },
  {
    id: "IL",
    name: "Israel",
  },
  {
    id: "IT",
    name: "Italy",
  },
  {
    id: "JM",
    name: "Jamaica",
  },
  {
    id: "JP",
    name: "Japan",
  },
  {
    id: "JEY",
    name: "Jersey",
  },
  {
    id: "JO",
    name: "Jordan",
  },
  {
    id: "KZ",
    name: "Kazakhstan",
  },
  {
    id: "KE",
    name: "Kenya",
  },
  {
    id: "KI",
    name: "Kiribati",
  },
  {
    id: "KR",
    name: "Korea, Republic of",
  },
  {
    id: "KW",
    name: "Kuwait",
  },
  {
    id: "KG",
    name: "Kyrgyzstan",
  },
  {
    id: "LA",
    name: "Lao People's Democratic Republic",
  },
  {
    id: "LV",
    name: "Latvia",
  },
  {
    id: "LB",
    name: "Lebanon",
  },
  {
    id: "LS",
    name: "Lesotho",
  },
  {
    id: "LR",
    name: "Liberia",
  },
  {
    id: "LY",
    name: "Libya",
  },
  {
    id: "LI",
    name: "Liechtenstein",
  },
  {
    id: "LT",
    name: "Lithuania",
  },
  {
    id: "LU",
    name: "Luxembourg",
  },
  {
    id: "MO",
    name: "Macao",
  },
  {
    id: "MG",
    name: "Madagascar",
  },
  {
    id: "MW",
    name: "Malawi",
  },
  {
    id: "MY",
    name: "Malaysia",
  },
  {
    id: "MV",
    name: "Maldives",
  },
  {
    id: "ML",
    name: "Mali",
  },
  {
    id: "MT",
    name: "Malta",
  },
  {
    id: "MH",
    name: "Marshall Islands",
  },
  {
    id: "MQ",
    name: "Martinique",
  },
  {
    id: "MR",
    name: "Mauritania",
  },
  {
    id: "MU",
    name: "Mauritius",
  },
  {
    id: "YT",
    name: "Mayotte",
  },
  {
    id: "MX",
    name: "Mexico",
  },
  {
    id: "FM",
    name: "Micronesia, Federated States of",
  },
  {
    id: "MD",
    name: "Moldova, Republic of",
  },
  {
    id: "MC",
    name: "Monaco",
  },
  {
    id: "MN",
    name: "Mongolia",
  },
  {
    id: "MNE",
    name: "Montenegro",
  },
  {
    id: "MS",
    name: "Montserrat",
  },
  {
    id: "MA",
    name: "Morocco",
  },
  {
    id: "MZ",
    name: "Mozambique",
  },
  {
    id: "MM",
    name: "Myanmar",
  },
  {
    id: "NA",
    name: "Namibia",
  },
  {
    id: "NR",
    name: "Nauru",
  },
  {
    id: "NP",
    name: "Nepal",
  },
  {
    id: "NL",
    name: "Netherlands",
  },
  {
    id: "NC",
    name: "New Caledonia",
  },
  {
    id: "NZ",
    name: "New Zealand",
  },
  {
    id: "NI",
    name: "Nicaragua",
  },
  {
    id: "NE",
    name: "Niger",
  },
  {
    id: "NG",
    name: "Nigeria",
  },
  {
    id: "NU",
    name: "Niue",
  },
  {
    id: "NF",
    name: "Norfolk Island",
  },
  {
    id: "MK",
    name: "North Macedonia",
  },
  {
    id: "MP",
    name: "Northern Mariana Islands",
  },
  {
    id: "NO",
    name: "Norway",
  },
  {
    id: "OM",
    name: "Oman",
  },
  {
    id: "PK",
    name: "Pakistan",
  },
  {
    id: "PW",
    name: "Palau",
  },
  {
    id: "PS",
    name: "Palestine, State of",
  },
  {
    id: "PA",
    name: "Panama",
  },
  {
    id: "PG",
    name: "Papua New Guinea",
  },
  {
    id: "PY",
    name: "Paraguay",
  },
  {
    id: "PE",
    name: "Peru",
  },
  {
    id: "PH",
    name: "Philippines",
  },
  {
    id: "PL",
    name: "Poland",
  },
  {
    id: "PT",
    name: "Portugal",
  },
  {
    id: "PR",
    name: "Puerto Rico",
  },
  {
    id: "QA",
    name: "Qatar",
  },
  {
    id: "RO",
    name: "Romania",
  },
  {
    id: "RU",
    name: "Russian Federation",
  },
  {
    id: "RW",
    name: "Rwanda",
  },
  {
    id: "RE",
    name: "R\u00e9union",
  },
  {
    id: "BLM",
    name: "Saint Barth\u00e9lemy",
  },
  {
    id: "KN",
    name: "Saint Kitts and Nevis",
  },
  {
    id: "LC",
    name: "Saint Lucia",
  },
  {
    id: "MAF",
    name: "Saint Martin (French part)",
  },
  {
    id: "PM",
    name: "Saint Pierre and Miquelon",
  },
  {
    id: "VC",
    name: "Saint Vincent and the Grenadines",
  },
  {
    id: "WS",
    name: "Samoa",
  },
  {
    id: "SM",
    name: "San Marino",
  },
  {
    id: "ST",
    name: "Sao Tome and Principe",
  },
  {
    id: "SA",
    name: "Saudi Arabia",
  },
  {
    id: "SN",
    name: "Senegal",
  },
  {
    id: "SRB",
    name: "Serbia",
  },
  {
    id: "SC",
    name: "Seychelles",
  },
  {
    id: "SL",
    name: "Sierra Leone",
  },
  {
    id: "SG",
    name: "Singapore",
  },
  {
    id: "SX",
    name: "Sint Maarten (Dutch part)",
  },
  {
    id: "SK",
    name: "Slovakia",
  },
  {
    id: "SI",
    name: "Slovenia",
  },
  {
    id: "SB",
    name: "Solomon Islands",
  },
  {
    id: "SO",
    name: "Somalia",
  },
  {
    id: "ZA",
    name: "South Africa",
  },
  {
    id: "SGS",
    name: "South Georgia and the South Sandwich Islands",
  },
  {
    id: "SS",
    name: "South Sudan",
  },
  {
    id: "ES",
    name: "Spain",
  },
  {
    id: "LK",
    name: "Sri Lanka",
  },
  {
    id: "SR",
    name: "Suriname",
  },
  {
    id: "SE",
    name: "Sweden",
  },
  {
    id: "CH",
    name: "Switzerland",
  },
  {
    id: "TW",
    name: "Taiwan, Province of China",
  },
  {
    id: "TJ",
    name: "Tajikistan",
  },
  {
    id: "TZ",
    name: "Tanzania, United Republic of",
  },
  {
    id: "TH",
    name: "Thailand",
  },
  {
    id: "TLS",
    name: "Timor-Leste",
  },
  {
    id: "TG",
    name: "Togo",
  },
  {
    id: "TO",
    name: "Tonga",
  },
  {
    id: "TT",
    name: "Trinidad and Tobago",
  },
  {
    id: "TN",
    name: "Tunisia",
  },
  {
    id: "TR",
    name: "Turkey",
  },
  {
    id: "TM",
    name: "Turkmenistan",
  },
  {
    id: "TC",
    name: "Turks and Caicos Islands",
  },
  {
    id: "TV",
    name: "Tuvalu",
  },
  {
    id: "UG",
    name: "Uganda",
  },
  {
    id: "UA",
    name: "Ukraine",
  },
  {
    id: "AE",
    name: "United Arab Emirates",
  },
  {
    id: "UK",
    name: "United Kingdom",
  },
  {
    id: "US",
    name: "United States",
  },
  {
    id: "UY",
    name: "Uruguay",
  },
  {
    id: "UZ",
    name: "Uzbekistan",
  },
  {
    id: "VU",
    name: "Vanuatu",
  },
  {
    id: "VE",
    name: "Venezuela, Bolivarian Republic of",
  },
  {
    id: "VN",
    name: "Viet Nam",
  },
  {
    id: "VG",
    name: "Virgin Islands, British",
  },
  {
    id: "VI",
    name: "Virgin Islands, U.S.",
  },
  {
    id: "WF",
    name: "Wallis and Futuna",
  },
  {
    id: "YE",
    name: "Yemen",
  },
  {
    id: "ZM",
    name: "Zambia",
  },
  {
    id: "ZW",
    name: "Zimbabwe",
  },
  {
    id: "ALA",
    name: "\u00c5land Islands",
  },
];

function App() {
  const [value, setValue] = React.useState("inventory");
  const [loadedGroups, setLoadedGroups] = useState([]);
  const loadedGroupsRef = useRef(loadedGroups);

  const [productIds, setProductIds] = useState([]);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [productBeingFetched, setProductBeingFetched] = React.useState(null);

  const [refreshInventory, setRefreshInventory] = useState(new Date());
  const [refreshImporters, setRefreshImporters] = useState(new Date());

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showSnack, setShowSnack] = useState(false);

  const [options, setOptions] = useState({});
  const [descriptionTemplates, setDescriptionTemplates] = useState([]);
  const [aiDescriptionTemplates, setAiDescriptionTemplates] = useState([]);
  const [aiTitleTemplates, setAiTitleTemplates] = useState([]);

  const [destinationCountry, setDestinationCountry] = useState("CH");

  useEffect(async () => {
    const response = await fetch(
      alisterData.url +
        "?" +
        new URLSearchParams({
          action: "alister_get_options",
        }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      openSnackBar("Could not retrieve saved options", "warning");
    }

    const result = await response.json();

    setOptions({ ...result });
    setDestinationCountry(result["manual_destination"] || "CH");
    setRefreshImporters(new Date());
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // Custom message to display in the confirmation dialog
      const confirmationMessage = 'Are you sure you want to leave?';
      // Older browsers may require the return value to be set
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(async () => {
    try {
      const response = await fetch(
        alisterData.url +
          "?" +
          new URLSearchParams({
            action: "alister_get_description_title_templates",
          }),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch description templates: ${response.status}`
        );
      }

      const result = await response.json();
      const descTemplates = result.filter((p) => p.type == "alister_desc_temp");
      const aiDescTemplates = result.filter(
        (p) => p.type == "alister_ai_desc_temp"
      );
      const aiTitleTemplates = result.filter(
        (p) => p.type == "alister_ai_ttl_temp"
      );
      setDescriptionTemplates(descTemplates);
      setAiDescriptionTemplates(aiDescTemplates);
      setAiTitleTemplates(aiTitleTemplates);
    } catch (err) {
      openSnackBar(err.message, "error");
    }
    setRefreshImporters(new Date());
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTabClose = React.useCallback(
    (event, tabToDelete) => {
      event.stopPropagation();
      const updatedTabs = loadedGroups.filter((tab) => {
        return tab.id !== tabToDelete;
      });

      if (tabToDelete == value) {
        const removedIndex = loadedGroups.findIndex(
          (lp) => lp.id == tabToDelete
        );
        if (updatedTabs.length == 0 || removedIndex == 0) {
          setValue("inventory");
        } else {
          setValue(loadedGroups[removedIndex - 1].id);
        }
      }
      loadedGroupsRef.current = [...updatedTabs];
      setLoadedGroups(loadedGroupsRef.current);
    },
    [loadedGroups, value]
  );

  const handleProductIdChange = (value) => {
    const aliIdMinLength = 10;
    const aliIdMaxLength = 16;

    const valueList = value
      .trim()
      .replace(/(\n|\t)+/g, ",")
      .split(",")
      .map((v) => v.trim());
    const addedProducts = [];
    for (const v of valueList) {
      const regex = new RegExp(
        `(\/(item|i)\/(?<!\\d)(?<url_id>\\d{${aliIdMinLength},${aliIdMaxLength}})(?!\\d)\.html)|(?<plain_id>^\\d{${aliIdMinLength},${aliIdMaxLength}}$)`
      );
      const found = v.match(regex);
      const queryString = found?.groups?.url_id || found?.groups?.plain_id;
      if (queryString) addedProducts.push(queryString);
    }
    setProductIds(addedProducts);
  };

  const addProductsToImportList = async () => {
    setRequestInProgress(true);
    const results = await Promise.allSettled(
      productIds.map((p) => {
        return fetch(alisterData.url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            action: "alister_add_product_to_queue",
            ali_id: p,
            destination: destinationCountry,
          }),
        });
      })
    );
    const countAdded = results.filter(
      (r) => r.status == "fulfilled" && r.value.ok
    );
    openSnackBar(
      `Added ${countAdded.length} out of ${productIds.length} products `,
      "info"
    );
    setRequestInProgress(false);
    setRefreshInventory(new Date());
  };

  const loadSelectedProducts = async (selected, groupName = "") => {
    const newlyLoadedProducts = [];
    setRequestInProgress(true);
    // Enable for testing
    // const data = {};
    // aliKeys.forEach((key) => {
    //   data[normalizeNames[key]] = test[key];
    // });

    // setLoadedGroups([
    //   {
    //     name: `666666`,
    //     id: "666666",
    //     products: [
    //       getProcessedProduct({ id: "666666", ...data }),
    //       getProcessedProduct({ id: "23423444", ...data }),
    //       getProcessedProduct({ id: "gdfghdfghdff", ...data }),
    //       getProcessedProduct({ id: "23452344521", ...data }),
    //       getProcessedProduct({ id: "gfjhfg787", ...data }),
    //     ],
    //     importStatus: "new",
    //     isNamed: true,
    //   },
    //   {
    //     name: `222323`,
    //     id: "222323",
    //     products: [getProcessedProduct({ id: "222323", ...data })],
    //     importStatus: "new",
    //     isNamed: true,
    //   },
    // ]);

    // setRequestInProgress(false);
    // return;
    // until here irakli

    for (const sp of selected) {
      setProductBeingFetched(sp.id);
      try {
        let data = null;
        if (sp.country && sp.lang) {
          data = await handleGetAliProduct(sp.id, {
            country: sp.country,
            lang: sp.lang,
          });
        }
        if (data && data?.shipping?.isAvailableForSelectedCountries) {
          newlyLoadedProducts.push(
            getProcessedProduct({
              id: sp.id,
              wooId: sp.wooId,
              wooProductId: sp.wooProductId,
              ...data,
            })
          );
          openSnackBar(`Product ${sp.id} loaded`, "success");
        } else {
          openSnackBar(`Product ${sp.id} is unavailable`, "warning");
        }
      } catch (e) {
        openSnackBar(e.message, "error");
      } finally {
        setProductBeingFetched(null);
      }
    }

    // Initialize group
    if (newlyLoadedProducts.length > 0) {
      // Get current groups
      const currentLoadedGroups = [...loadedGroupsRef.current];
      const isNamed = groupName != "";
      const noNameGroups = currentLoadedGroups.filter((g) => !g.isNamed);
      loadedGroupsRef.current = [
        ...currentLoadedGroups,
        {
          name: isNamed ? groupName : `Group #${noNameGroups.length + 1}`,
          id: selected[0].id,
          products: newlyLoadedProducts,
          importStatus: "new",
          isNamed,
        },
      ];
      setLoadedGroups(loadedGroupsRef.current);

      setRefreshImporters(new Date());
    }

    setRequestInProgress(false);
  };

  const getProcessedProduct = (product) => {
    const processedProduct = {
      productId: product.id,
      wooId: product.wooId,
      wooProductId: product.wooProductId,
      url: `https://aliexpress.com/item/${product.id}.html`,
      productTitle: product.name,
      productDescription: "",
      aliDescription: product.description,
      categories: [],
      tags: [],
      carrierSelected: "",
      productUrl: product.url,
      shippingCarriers: product.shipping?.carriers || [],
      productImages: product.images.map((img) => {
        return { selected: true, url: img };
      }),
      variations: [],
      properties: {},
      originalProperties: {},
      permalink: "",
      importProgress: 0,
      timestamp: new Date(),
    };

    const resultVariations = product?.variations || [];
    const resultProperties = product?.properties || {};

    const newKeys = Object.keys(resultProperties).length;

    if (!resultVariations || resultVariations.length == 0)
      throw new Error(
        `Error! Variations missing on selected aliexpress product!`
      );

    let pt = resultVariations.length == 1 || !newKeys ? "simple" : "variable";

    // Filter variations with stock = 0
    const filteredVariations = resultVariations.filter((v) => {
      return v.stock != "0";
    });

    if (pt == "variable") {
      Object.keys(resultProperties).forEach((k) => {
        resultProperties[k].applyTransformations = true;
        Object.keys(resultProperties[k].values).forEach((valueKey) => {
          resultProperties[k].values[valueKey].active = true;
          const matchingVariation = filteredVariations.find((v) => {
            return v.properties.find((vp) => vp.value.id == valueKey);
          });
          if (matchingVariation)
            resultProperties[k].values[valueKey].varImage =
              matchingVariation.imageUrl;
        });
      });

      let clone = JSON.parse(JSON.stringify(resultProperties));

      processedProduct.properties = resultProperties;
      processedProduct.originalProperties = clone;

      if (filteredVariations.length <= 0)
        throw new Error("Variations not available");

      const formattedVariations = [];
      filteredVariations.forEach((v) => {
        formattedVariations.push({
          skip: false,
          img: v.imageUrl,
          foreign_sku: v.sku,
          properties: v.properties,
          sku: getHashCode(processedProduct.productId + v.sku)
            .toString(16)
            .toUpperCase(),
          external_varid: getHashCode(processedProduct.productId + v.sku)
            .toString(16)
            .toUpperCase(),
          aliPrice: v.price.web.originalPrice.value.toString(),
          storePrice: "0",
          stock: v.stock,
        });
      });
      processedProduct.variations = formattedVariations;
    } else {
      processedProduct.variations = [
        {
          skip: false,
          img: filteredVariations[0].imageUrl
            ? filteredVariations[0].imageUrl
            : product.images[0],
          foreign_sku: filteredVariations[0].sku,
          properties: filteredVariations[0].properties,
          sku: getHashCode(
            processedProduct.productId + filteredVariations[0].sku
          )
            .toString(16)
            .toUpperCase(),
          external_varid: getHashCode(
            processedProduct.productId + filteredVariations[0].sku
          )
            .toString(16)
            .toUpperCase(),
          aliPrice:
            filteredVariations[0].price.web.originalPrice.value.toString(),
          storePrice: "0",
          stock: filteredVariations[0].stock,
        },
      ];
    }
    return processedProduct;
  };

  const handleGetAliProduct = async (value, args) => {
    let formattedData = null;
    const response = await fetch(
      alisterData.url +
        "?" +
        new URLSearchParams({
          action: "get_product_data",
          id: value,
          ...args,
        }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result?.statusCode != "200") {
      throw new Error(`Error! status: ${result?.data?.status}`);
    }

    formattedData = {};
    aliKeys.forEach((key) => {
      formattedData[normalizeNames[key]] = result.data[key];
    });

    return formattedData;
  };

  // !!! MODIFIES loadedGroups
  const setGroupImportStatus = (id, status) => {
    const groups = loadedGroupsRef.current;
    const loadedGroup = groups.find((lg) => lg.id == id);
    if (loadedGroup) {
      loadedGroup.importStatus = status;
      loadedGroupsRef.current = [...groups];
      setLoadedGroups(loadedGroupsRef.current);
    }
  };

  // !!! MODIFIES loadedGroups
  const handleRemoveProductFromGroup = (filteredProducts, groupId) => {
    const groups = loadedGroupsRef.current;
    const group = groups.find((lg) => lg.id == groupId);
    if (group) {
      group.products = filteredProducts;
      loadedGroupsRef.current = [...groups];
      setLoadedGroups(loadedGroupsRef.current);
      setRefreshInventory(new Date());
    }
  };

  // !!! MODIFIES loadedGroups
  const handleDeleteProductFromGroup = async (
    filteredProducts,
    groupId,
    productId
  ) => {
    const groups = loadedGroupsRef.current;
    const group = groups.find((lg) => lg.id == groupId);
    if (group) {
      const product = group.products.find((p) => p.productId == productId);
      group.products = filteredProducts;
      if (product) {
        await deleteProductsFromImportList(
          product.wooId,
          product.wooProductId,
          productId
        );
      }
      loadedGroupsRef.current = [...groups];
      setLoadedGroups(loadedGroupsRef.current);
      setRefreshInventory(new Date());
    }
  };

  const deleteProductsFromImportList = async (
    wooId,
    wooProductId,
    productId
  ) => {
    setRequestInProgress(true);
    const response = await fetch(alisterData.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "alister_remove_product",
        id: wooId,
        product_id: wooProductId || 0,
      }),
    });

    if (response.ok)
      openSnackBar(`Removed product: ${productId} from inventory`, "info");
    setRequestInProgress(false);
  };

  const getNewOptions = async () => {
    const response = await fetch(
      alisterData.url +
        "?" +
        new URLSearchParams({
          action: "alister_get_options",
        }),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      openSnackBar("Could not retrieve saved options", "warning");
    }

    const result = await response.json();

    setOptions({ ...result });
    setDestinationCountry(result["manual_destination"] || "CH");
    setRefreshImporters(new Date());
  };

  const getNewDescriptionTemplates = async () => {
    try {
      const response = await fetch(
        alisterData.url +
          "?" +
          new URLSearchParams({
            action: "alister_get_description_title_templates",
          }),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch description templates: ${response.status}`
        );
      }

      const result = await response.json();
      const descTemplates = result.filter((p) => p.type == "alister_desc_temp");
      const aiDescTemplates = result.filter(
        (p) => p.type == "alister_ai_desc_temp"
      );
      const aiTitleTemplates = result.filter(
        (p) => p.type == "alister_ai_ttl_temp"
      );
      setDescriptionTemplates(descTemplates);
      setAiDescriptionTemplates(aiDescTemplates);
      setAiTitleTemplates(aiTitleTemplates);
    } catch (err) {
      openSnackBar(err.message, "error");
    }
    setRefreshImporters(new Date());
  };

  const openSnackBar = React.useCallback((message, messageType) => {
    setMessage(message);
    setMessageType(messageType);
    setShowSnack(true);
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%" }}>
        <CustomSnackBar
          open={showSnack}
          handleClose={() => {
            setShowSnack(false);
          }}
          messageType={messageType}
          message={message}
        ></CustomSnackBar>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 24,
              color: "#E14664",
              padding: "14px 0 0 14px",
              fontFamily: "Nunito",
            }}
          >
            alister
          </div>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { background: "#ff9800" } }}
          >
            <Tab
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    color: "black",
                    textTransform: "capitalize",
                  }}
                >
                  Inventory
                </span>
              }
              value="inventory"
            />
            {loadedGroups.map((group, index) => {
              return (
                <Tab
                  key={group.id}
                  value={group.id}
                  label={
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "black",
                        textTransform: "capitalize",
                      }}
                    >
                      {group.name}
                      {group.importStatus != "inProgress" ? (
                        <IconButton
                          component="div"
                          onClick={(event) => handleTabClose(event, group.id)}
                        >
                          <HighlightOffOutlinedIcon
                            style={{ color: "black" }}
                          />
                        </IconButton>
                      ) : (
                        <CircularProgress
                          style={{ width: 15, height: 15, marginLeft: 8 }}
                        ></CircularProgress>
                      )}
                    </span>
                  }
                />
              );
            })}
          </Tabs>
        </Box>
        <TabPanel value={value} index={"inventory"}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <span class="accordion-header">Manual import</span>
              <HelpDialog
                title="Manual import"
                content={ManualImportHelpContent}
              ></HelpDialog>
            </AccordionSummary>
            <AccordionDetails>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <p style={{ marginTop: 0, fontWeight: "500" }}>
                  Paste your one or more AliExpress product links here to add to
                  the inventory table.
                </p>
                <Select
                  name={"Destination"}
                  size="small"
                  onChange={(event) => {
                    setDestinationCountry(event.target.value);
                    setAlisterOption(
                      "manual_destination",
                      event.target.value,
                      openSnackBar
                    );
                  }}
                  value={destinationCountry}
                >
                  {destinationCountries.map((opt) => {
                    return (
                      <MenuItem value={opt.id || opt}>{opt.name}</MenuItem>
                    );
                  })}
                </Select>
              </div>
              <textarea
                rows="4"
                style={{ width: "100%", resize: "none" }}
                onChange={(e) => handleProductIdChange(e.target.value)}
              ></textarea>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <b>ID - s detected: {productIds.length}</b>
                </span>
                <LoadingButton
                  loading={requestInProgress}
                  variant="contained"
                  size="small"
                  color="primary_ultimus"
                  disabled={productIds.length <= 0}
                  onClick={(event) => addProductsToImportList()}
                  style={{ width: "10%" }}
                >
                  ADD
                </LoadingButton>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <span class="accordion-header">Import Rules </span>
              <HelpDialog
                title="Import rules"
                content={ImportListHelpContent}
              ></HelpDialog>
            </AccordionSummary>
            <AccordionDetails>
              <FilterManager
                setRequestInProgress={React.useCallback(
                  () => setRequestInProgress
                )}
                setRefreshInventory={setRefreshInventory}
                openSnackBar={openSnackBar}
                requestInProgress={requestInProgress}
                options={options}
              ></FilterManager>
            </AccordionDetails>
          </Accordion>
          <InventoryTable
            loadedGroups={loadedGroups}
            refreshInventory={refreshInventory}
            requestInProgress={requestInProgress}
            productBeingFetched={productBeingFetched}
            loadSelectedProducts={loadSelectedProducts}
            setRequestInProgress={setRequestInProgress}
            openSnackBar={openSnackBar}
            handleTabChange={setValue}
          ></InventoryTable>
        </TabPanel>
        {loadedGroups.map((group) => {
          return (
            <TabPanel value={value} index={group.id} key={group.id}>
              <Importer
                openSnackBar={openSnackBar}
                groupId={group.id}
                products={group.products}
                options={options}
                descriptionTemplates={descriptionTemplates}
                aiDescriptionTemplates={aiDescriptionTemplates}
                aiTitleTemplates={aiTitleTemplates}
                refreshImporters={refreshImporters}
                onRefreshOptions={getNewOptions}
                onRemoveProductFromGroup={handleRemoveProductFromGroup}
                onDeleteProductFromGroup={handleDeleteProductFromGroup}
                onGroupImportStatusChange={setGroupImportStatus}
                onRefreshInventory={setRefreshInventory}
                onRefreshDescriptionTemplates={getNewDescriptionTemplates}
              ></Importer>
            </TabPanel>
          );
        })}
      </Box>
    </ThemeProvider>
  );
}

export default App;

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {<Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
