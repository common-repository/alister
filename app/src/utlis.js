export const LoadingStatus = (props) => {
  return (
    <span
      style={{
        marginLeft: "auto",
        color: "#D0DB7A",
        fontSize: "x-large",
        marginBottom: props.marginBottom,
      }}
    >
      {props.loadingWidth}%
    </span>
  );
};

export const transformPropertiesForAI = (properties) => {
  const result = [];
  Object.keys(properties).forEach((key) => {
    const property = properties[key];
    const name = property.name;
    const propertyValues = [];
    Object.keys(property.values).forEach((vk) => {
      if (property.values[vk].active)
        propertyValues.push(property.values[vk].name);
    });
    if (propertyValues.length > 0)
      result.push(`${name}: ${propertyValues.join(", ")}`);
  });
  return result;
};

export const getHashCode = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const findLongestMatchInDict = (keys, value, optionDict) => {
  for (const key of keys) {
    let regex = new RegExp(`(\\b|^)(${key})(\\b|$)`, 'gmi');
    const index = value.search(regex);
    if (index != -1) {
      return value.replace(regex, `$1${optionDict[key]}$3`);
    }
  }
  return value;
};



export const setAlisterOption = async (name, value, openSnackBar) => {
  const response = await fetch(alisterData.url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "alister_set_option",
      name,
      value,
    }),
  });

  if (!response.ok) {
    openSnackBar(
      `Could not save option ${name}. Reason: ${response.statusText}`,
      "error"
    );
  }
};

export const updateProductMeta = async (id, key, value, openSnackBar) => {
  const response = await fetch(alisterData.url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "alister_edit_product_meta",
      id,
      key,
      value,
    }),
  });

  if (!response.ok) {
    openSnackBar(
      `Could not update meta ${key}. Reason: ${response.statusText}`,
      "error"
    );
  }
};

export const ImportListHelpContent = () => {
  return (
    <div>
      <p>
        This section is your gold mine of AliExpress products. Firstly, set your
        own criteria of what kind of products you would like to add to the
        inventory table. For example, maybe you want to have top ten best rated
        cat beds imported on a weekly basis (btw this is called polling).
      </p>
      <ol>
        <li>Give this rule a name ex.: ‘Top selling cat beds’.</li>
        <li>
          Paste the URL to the cat bed category on AliExpress OR search on
          AliExpress for ‘cat beds’ and paste the link with the results.
        </li>
        <li>
          Next, decide on a product and seller’s rating (product rating, seller
          rating) and how many times the item was sold (orders). ‘Limit’ means
          how many cat beds you would like to import each time and how often
          (polling).
        </li>
        <li>
          Lastly, set the language, destination and currency of your shop.
        </li>
        <li>
          Hit ‘check’ button to see if your criteria worked according to your
          expectations (you can click on each product link generated). If so,
          you can already hit ‘import’ and add those products to the inventory
          table and also ‘save’ the rule.
        </li>
      </ol>
      <p>
        From now on, Alister will be searching for the top rated cat beds for
        you so you never have to worry about being on top of the trends. You can
        set as many import rules as you wish.
      </p>
    </div>
  );
};

export const ManualImportHelpContent = () => {
  return (
    <div>
      <p>
        Welcome to Alister! In this section you can paste one or multiple
        AliExpress product links and hit ‘add’ button to add the products to the
        inventory table below.
      </p>
    </div>
  );
};

export const InventoryTableHelpContent = () => {
  return (
    <div>
      <p>
        This is where you can find all the added products - it’s like a
        warehouse. Here you can ‘load’ the product to the importer tool, edit it
        and publish it straight to your store. Once you click ‘load', the
        product will appear in a tab at the top of this page.
      </p>
    </div>
  );
};

export const AIGeneratorHelpContent = () => {
  return (
    <div>
      <p>
        This tool will do the creative job for you - it will generate the title
        and the description for the product.
      </p>
      <p>
        Just describe the type of the title or the description you want to be
        generated. There are 3 variables available:
        <ol>
          <li>
            {"{{ali_title}}"} - This will be replaced by the title inside
            "Title" input.
          </li>
          <li>
            {"{{ali_description}}"} - This will be replaced by the description
            on Aliexpress.
          </li>
          <li>
            {"{{ali_properties}}"} - This will be replaced by the comma
            separated list of properties. All modifications will apply. Example:
            Color: blue, black, Size: S, M, XL
          </li>
        </ol>
      </p>
      <p>It is recommended to specify number of words you want generated.</p>
      <p>
        Now you can hit a ‘get description’ or a ‘get title’ buttons to see the
        outcome.
      </p>
    </div>
  );
};

export const DescriptionTemplatesHelpContent = () => {
  return (
    <div>
      <p>
        Once you write descriptions for some of your products you can save them
        as templates. Just click the save icon inside the text editor, set a
        name and click save. Saved descriptions will be available inside group
        modificaiton panel. There are 2 variables available for your templates.
      </p>
      <ol>
        <li>
          {"{{title}}"} - This will be replaced by the title inside "Title"
          input.
        </li>
        <li>
          {"{{price}}"} - This will be replaced by the price of the product.
          (First variation if there are many)
        </li>
      </ol>
    </div>
  );
};

export const ProductGalleryHelpContent = () => {
  return (
    <div>
      <p>
        All the product photos are displayed here. You can add more images,
        deselect some of them or drag and drop to rearrange.
      </p>
      <p>
        The first photo (with a green border) will be the main product image.
      </p>
    </div>
  );
};

export const PricingHelpContent = () => {
  return (
    <div>
      <p>
        Price mutliplier lets you set store prices taking into account supplier
        price on aliexpress and shipping const if needed. If shipping carrier is
        selected for the product price multiplier will multiply shipping +
        product cost and set the result as a store price.
      </p>
      <p>
        Let’s say the product on AliExpress costs 5$. If you selected a carrier
        and you input ‘2' in the multiplier, you’ll be selling the item for:
        shipping + 5$ x 2 = XX$ and so on.
      </p>
    </div>
  );
};

export const CategoryHelpContent = () => {
  return (
    <div>
      <p>
        Will add categories to all selected products
      </p>
    </div>
  );
};

export const TagsHelpContent = () => {
  return (
    <div>
      <p>
        Will add tags to all selected products
      </p>
    </div>
  );
};


export const PropertiesHelpContent = () => {
  return (
    <div>
      <p>
        There are several transformations you can apply on properties of
        variable products.
        <ol>
          <li>
            Find and Replace - you can find text inside property values and
            replace them.
          </li>
          <li>Set values to 1-9 - replace property values with numbers</li>
          <li>
            Set values to A-Z - replace property values with capitalized letters
          </li>
          <li>
            Translate - Apply translations from your dictionary. If you click
            settings icon a table will pop up. You can add inputs to the
            dictionary, like translations and apply them when needed.
          </li>
        </ol>
      </p>
      <p>
        You can reset all values back to original and you can choose which
        properties will be transformed by using checkboxes next to property
        names.
      </p>
    </div>
  );
};
