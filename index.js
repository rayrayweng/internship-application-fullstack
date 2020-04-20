/**
 * Changes the attributes within an element
 */
class AttributeChanger {
  constructor(attributeName, newText) {
    this.attributeName = attributeName;
    this.newText = newText;
  }

  element(element) {
    if (element.getAttribute(this.attributeName)) {
      element.setAttribute(this.attributeName, this.newText);
    }
  }
}

/**
 * Changes the inner content and an element
 */
class TextChanger {
  constructor(id, newText) {
    this.id = id;
    this.newText = newText;
  }

  element(element) {
    if (this.id === "" || element.getAttribute("id") === this.id) {
      element.setInnerContent(this.newText);
    }
  }
}

/**
 * Grabs the cookie with name from the request headers.
 * Found method on the Cloudflare Workers templates page
 *
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null;
  let cookieString = request.headers.get("Cookie");
  if (cookieString) {
    let cookies = cookieString.split(";");
    cookies.forEach((cookie) => {
      let cookieName = cookie.split("=")[0].trim();
      if (cookieName === name) {
        let cookieVal = cookie.split("=")[1];
        result = cookieVal;
      }
    });
  }
  return result;
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Responds one of the two variants given, with cookies allowing for persisting variants
 *
 * @param {Request} request
 */
async function handleRequest(request) {
  const response = await fetch(
    "https://cfw-takehome.developers.workers.dev/api/variants"
  );
  const json_data = await response.json();
  const variants = json_data.variants;

  // getting and setting cookies
  let variant_num = getCookie(request, "var_num");
  if (variant_num === null) {
    variant_num = Math.floor(2 * Math.random());
  }
  const variant = fetch(variants[variant_num]);
  let res = await variant;
  res = new Response(res.body, res);
  res.headers.set("Set-Cookie", "var_num=" + variant_num.toString());

  return new HTMLRewriter()
    .on("title", new TextChanger("", "Ray Weng Coding Challenge"))
    .on("h1", new TextChanger("title", "Welcome!"))
    .on(
      "p",
      new TextChanger("description", "The link below goes to my Github!")
    )
    .on("a", new TextChanger("url", "Github Link"))
    .on("a", new AttributeChanger("href", "https://github.com/rayrayweng"))
    .transform(res);
}
