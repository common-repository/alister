import React, { useState, useEffect } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { Tooltip } from "@mui/material";

import { setAlisterOption } from "../../utlis";

import "../../styles/FilterManager/FilterManager.css";

export const FilterManager = React.memo((props) => {
  const setRequestInProgress = props.setRequestInProgress;
  const requestInProgress = props.requestInProgress;
  const openSnackBar = props.openSnackBar;
  const setRefreshInventory = props.setRefreshInventory;
  const options = props.options;

  const filterKeys = [
    "filterName",
    "filterURL",
    // "reviewCount",
    "reviewScore",
    "sellerScore",
    "orderCount",
    "maxProductsToFetch",
    // "shippingMethods",
    "pollingOption",
    "locale",
    "destination",
    "currency",
  ];
  const [newFilterValues, setNewFilterValues] = useState({
    filterName: {
      label: "Name",
      type: "text",
      value: null,
      required: true,
      tooltip: "Give your Import Rule a name to help identify it",
    },
    filterURL: {
      label: "URL",
      type: "url",
      value: null,
      required: true,
      tooltip: "Aliexpress category link or search term link",
    },
    reviewCount: {
      label: "Product reviews",
      placeholder: "100",
      type: "number",
      min: 0,
      max: 100000,
      step: 50,
      value: 0,
      required: true,
      tooltip: "",
    },
    reviewScore: {
      label: "Product rating",
      type: "number",
      placeholder: "4.2",
      min: 0,
      max: 5,
      step: 0.1,
      value: 0,
      required: true,
      tooltip: "0.0 - 5.0 (0-5 star rating of the products)",
    },
    sellerScore: {
      label: "Seller rating",
      type: "number",
      placeholder: "89",
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      required: true,
      tooltip: "0.0 - 100.0 (% rating of the seller)",
    },
    orderCount: {
      label: "Orders",
      type: "number",
      placeholder: "5400",
      min: 0,
      max: 1000000,
      step: 100,
      value: 0,
      required: true,
      tooltip: "0 - 9999999 (the amount of times the items wa sold)",
    },
    maxProductsToFetch: {
      label: "Limit",
      type: "number",
      placeholder: "10",
      min: 1,
      max: 100,
      step: 1,
      value: 1,
      required: true,
      tooltip:
        "The amount of products to be added on each iteration of the rule",
    },
    shippingMethods: {
      label: "Shipping",
      type: "select",
      value: [],
      options: [
        { id: "CAINIAO_STANDARD", name: "AliExpress Standard Shipping" },
        { id: "CAINIAO_PREMIUM	AliExpress", name: "Premium Shipping" },
        { id: "EMS_ZX_ZX_US", name: "	ePacket" },
        { id: "AE_CAINIAO_STANDARD", name: "	Cainiao Expedited Standard" },
        { id: "YANWEN_ECONOMY", name: "	Yanwen Economic Air Mail" },
        { id: "AE_CN_SUPER_ECONOMY_G", name: "	Cainiao Super Economy Global" },
        { id: "SUNYOU_ECONOMY", name: "	Sunyou Economic Air Mail" },
        { id: "E_EMS", name: "	e-EMS" },
        { id: "Other", name: "	Seller's Shipping Method" },
        { id: "SGP_OMP	4PX", name: " Singapore Post OM Pro" },
        { id: "YANWEN_JYT", name: "	China Post Ordinary Small Packet Plus" },
        { id: "EMS", name: "	EMS" },
        { id: "DHL", name: "	DHL" },
        { id: "CPAM", name: "	China Post Registered Air Mail" },
        { id: "POST_NL", name: "	PostNL" },
        { id: "FEDEX", name: "	Fedex IP" },
        { id: "SF", name: "	SF Express" },
        { id: "TNT", name: "TNT" },
        { id: "UPS", name: "	UPS Express Saver" },
        { id: "UPSE", name: "	UPS Expedited" },
      ],
      required: true,
    },
    pollingOption: {
      label: "Polling",
      type: "select",
      value: "weekly",
      options: ["daily", "weekly", "monthly", "manual"],
      required: true,
      tooltip: "Frequency to run the rule",
    },
    locale: {
      label: "Language",
      type: "select",
      value: "en_US",
      options: [
        { id: "en_US", name: "English" },
        { id: "de_DE", name: "German" },
        { id: "nl_NL", name: "Dutch" },
        { id: "es_ES", name: "Spanish" },
        { id: "ru_RU", name: "Russian" },
        { id: "tr_TR", name: "Turkish" },
        { id: "ar_MA", name: "Arabic" },
        { id: "fr_FR", name: "French" },
        { id: "it_IT", name: "Italian" },
        { id: "ko_KR", name: "Korean" },
        { id: "pl_PL", name: "Polish" },
        { id: "pt_BR", name: "Brazilian" },
      ],
      required: true,
      tooltip: "Aliexpress website language",
    },
    destination: {
      label: "Destination",
      type: "select",
      value: "US",
      options: [
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
      ],
      required: true,
      tooltip: "Aliexpress website country",
    },
    currency: {
      label: "Currency",
      type: "select",
      value: "USD",
      options: [
        "AUD",
        "BRL",
        "CAD",
        "CHF",
        "CLP",
        "CZK",
        "EUR",
        "GBP",
        "HUF",
        "IDR",
        "INR",
        "JPY",
        "KES",
        "KRW",
        "MXN",
        "NZD",
        "PLN",
        "RUB",
        "SAR",
        "SEK",
        "SGD",
        "TRY",
        "USD",
      ],
      required: true,
      tooltip: "Your store currency, used for multiplier in pricing rules.",
    },
  });
  const [filters, setFilters] = useState([]);
  const [importInProgress, setImportInProgress] = useState(false);
  const [requiredValuesMissing, setRequiredValuesMissing] = useState(true);
  const [newFilterProducts, setNewFilterProducts] = useState([]);

  const handleValueChange = (key, event) => {
    const newValue = event.target.value;
    newFilterValues[key].value = newValue;
    const modified = { ...newFilterValues };
    setNewFilterValues(modified);
    setRequiredValuesMissing(
      !filterKeys.every((k) => {
        const fv = modified[k];
        return !fv.required || ![null, undefined, ""].includes(fv.value);
      })
    );
    if (!["filterName", "filterURL"].includes(key)) {
      setAlisterOption(`new_filter_${key}`, newValue, openSnackBar);
    }
  };

  useEffect(() => {
    getFilters();
  }, []);

  useEffect(() => {
    filterKeys.map((fk) => {
      if (["filterName", "filterURL"].includes(fk)) return;
      const optionName = `new_filter_${fk}`;
      if (optionName in options) {
        newFilterValues[fk].value = options[optionName];
      }
    });
    setNewFilterValues({ ...newFilterValues });
  }, [props.options]);

  const getFormattedFilterData = () => {
    return {
      name: newFilterValues["filterName"].value,
      source: newFilterValues["filterURL"].value,
      currency: newFilterValues["currency"].value,
      locale: newFilterValues["locale"].value,
      region: newFilterValues["destination"].value,
      max_products: newFilterValues["maxProductsToFetch"].value,
      min_num_of_reviews: newFilterValues["reviewCount"].value,
      min_review_score: newFilterValues["reviewScore"].value,
      min_seller_score: newFilterValues["sellerScore"].value,
      min_orders: newFilterValues["orderCount"].value,
      shipping_methods: newFilterValues["shippingMethods"].value,
      polling_option: newFilterValues["pollingOption"].value,
    };
  };

  const addNewFilter = async () => {
    setImportInProgress(true);
    const response = await fetch(alisterData.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "alister_add_import_rule",
        ...getFormattedFilterData(),
      }),
    });

    if (!response.ok) {
      openSnackBar(
        `Could not add filter. Reason: ${response.statusText}`,
        "error"
      );
    } else {
      openSnackBar("Filter saved", "success");
      getFilters();
    }
    setImportInProgress(false);
  };

  const pollProductsInFilter = async (
    postId,
    insert_in_queue = false,
    import_data = false
  ) => {
    setRequestInProgress(true);
    setImportInProgress(true);
    const response = await fetch(alisterData.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "alister_poll_products_from_queue",
        id: postId,
        ...(import_data && getFormattedFilterData()),
        insert_in_queue: insert_in_queue ? "yes" : "no",
      }),
    });

    if (!response.ok) {
      openSnackBar(
        `Could not poll products. Reason: ${response.statusText}`,
        "error"
      );
    } else {
      let productData = null;
      try {
        productData = await response.json();
        setNewFilterProducts(productData.products ? productData.products : []);
        setRefreshInventory(new Date());
      } catch (e) {
        openSnackBar(`Error. Reason: ${e}`, "error");
      }
    }
    setRequestInProgress(false);
    setImportInProgress(false);
  };

  const getFilters = async () => {
    setRequestInProgress(true);
    try {
      let result = [];
      const response = await fetch(
        alisterData.url +
          "?" +
          new URLSearchParams({
            action: "alister_get_import_rules",
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
          openSnackBar(
            `Could not retrieve filters: ${response.statusText}`,
            "error"
          )
        );
      }
      result = await response.json();
      setFilters(
        result.map((item, index) => {
          return {
            id: item.id,
            filterName: item.name,
            filterURL: item.source,
            currency: item.currency,
            locale: item.locale,
            destination: item.region,
            maxProductsToFetch: item.max_products,
            reviewCount: item.min_num_of_reviews,
            reviewScore: item.min_review_score,
            sellerScore: item.min_seller_score,
            orderCount: item.min_orders,
            shippingMethods: item.shipping_methods?.toString(),
            pollingOption: item.polling_option,
            delete_nonce: item.delete_nonce,
          };
        })
      );
      return result;
    } catch (e) {
      openSnackBar(`Could not retrieve filters: ${e.message}`, "error");
    } finally {
      setRequestInProgress(false);
    }
  };

  const deleteFilter = async (postId, delete_nonce) => {
    setRequestInProgress(true);
    setImportInProgress(true);
    const response = await fetch(alisterData.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "delete-post",
        id: postId,
        _ajax_nonce: delete_nonce,
      }),
    });

    if (!response.ok) {
      openSnackBar(
        `Could not delete filter. Reason: ${response.statusText}`,
        "error"
      );
    } else {
      openSnackBar("Filter removed", "success");
      getFilters();
      getFilters();
    }
    setRequestInProgress(false);
    setImportInProgress(false);
  };

  return (
    <div>
      <div class="creator-div">
        <div class="filter-inputs">
          {filterKeys.map((key) => {
            const fv = newFilterValues[key];
            return (
              <div class="import-filter-input">
                <Tooltip title={fv.tooltip}>
                  <label for={key}>{fv.label}</label>
                </Tooltip>
                {fv.type != "select" ? (
                  <input
                    type={fv.type}
                    id="fname"
                    name={key}
                    placeholder={fv.placeholder}
                    step={fv.step}
                    onChange={(event) => handleValueChange(key, event)}
                    value={fv.value}
                    min={fv.min}
                    max={fv.max}
                  />
                ) : (
                  <select
                    name={key}
                    onChange={(event) => handleValueChange(key, event)}
                    value={fv.value}
                    multiple={key == "shippingMethods" ? true : false}
                  >
                    {fv.options.map((opt) => {
                      return (
                        <option value={opt.id || opt}>
                          {opt.name || opt.toString()}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        <div class="action-buttons">
          <LoadingButton
            disabled={requestInProgress || requiredValuesMissing}
            loading={importInProgress}
            variant="contained"
            onClick={(event) => pollProductsInFilter(null, false, true)}
            size="small"
            color="primary_ultimus"
          >
            Check
          </LoadingButton>
          <LoadingButton
            disabled={requestInProgress || requiredValuesMissing}
            loading={importInProgress}
            variant="contained"
            onClick={(event) => pollProductsInFilter(null, true, true)}
            size="small"
            style={{ margin: "0px 10px" }}
            color="primary_ultimus"
          >
            Import
          </LoadingButton>
          <LoadingButton
            disabled={requestInProgress || requiredValuesMissing}
            loading={importInProgress}
            variant="contained"
            onClick={(event) => addNewFilter()}
            size="small"
            color="primary_ultimus"
          >
            Save
          </LoadingButton>
        </div>
        <div
          style={{
            display: "flex",
            listStyle: "none",
            overflow: "auto",
            padding: 20,
            paddingBottom: 10,
          }}
          component="ul"
        >
          {newFilterProducts.map((dt, index) => {
            return (
              <li key={dt.id} style={{ marginRight: 5 }}>
                <Chip
                  size="medium"
                  style={{
                    cursor: "pointer",
                    color: "white",
                    backgroundColor: "#D0DB7A",
                  }}
                  component="a"
                  href={`https://aliexpress.com/item/${dt.id}.html`}
                  target="_blank"
                  label={`Product #${index + 1} - Rating ${
                    dt.rating ? dt.rating : "N/A"
                  } `}
                />
              </li>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <TableContainer component={Paper} elevation={4}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                {filterKeys
                  .filter((key) => key != "filterURL")
                  .map((key) => {
                    const fv = newFilterValues[key];
                    return (
                      <TableCell
                        align="left"
                        style={{ fontWeight: "bold", fontSize: "small" }}
                      >
                        {fv.label}
                      </TableCell>
                    );
                  })}
                <TableCell
                  align="left"
                  style={{ fontWeight: "bold", fontSize: "small" }}
                ></TableCell>
                <TableCell
                  align="left"
                  style={{ fontWeight: "bold", fontSize: "small" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filters.map((row) => {
                return (
                  <TableRow hover>
                    {filterKeys
                      .filter((key) => key != "filterURL")
                      .map((key) => {
                        return (
                          <TableCell align="left">
                            {key == "filterName" ? (
                              <a href={row["filterURL"]} target="_blank">
                                {row[key]}
                              </a>
                            ) : (
                              row[key]
                            )}
                          </TableCell>
                        );
                      })}
                    <TableCell align="left">
                      <IconButton
                        disabled={requestInProgress || importInProgress}
                        color="primary_ultimus"
                        onClick={(event) =>
                          deleteFilter(row.id, row.delete_nonce)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">
                      <LoadingButton
                        loading={importInProgress}
                        disabled={requestInProgress}
                        variant="contained"
                        onClick={(event) =>
                          pollProductsInFilter(row.id, true, false)
                        }
                        size="small"
                        style={{ margin: "0px 10px" }}
                        color="primary_ultimus"
                      >
                        Import
                      </LoadingButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
});
