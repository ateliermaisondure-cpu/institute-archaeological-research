/* =========================================================
   UNIVERSAL WEBSITE TRANSLATION
   Institute of Archaeological Research
   ========================================================= */

(function () {

  "use strict";


  const translateLinks =
    document.querySelectorAll(
      "[data-google-translate]"
    );


  if (!translateLinks.length) {
    return;
  }


  function getBrowserLanguage() {

    const languages =
      navigator.languages
      && navigator.languages.length
        ? navigator.languages
        : [navigator.language];


    for (
      let i = 0;
      i < languages.length;
      i++
    ) {

      const language =
        String(
          languages[i] || ""
        )
          .toLowerCase()
          .split("-")[0];


      if (language) {
        return language;
      }

    }


    return "en";

  }


  function getSourceLanguage() {

    return String(
      document.documentElement.lang
      || "auto"
    )
      .toLowerCase()
      .split("-")[0];

  }


  function getTargetLanguage() {

    const browserLanguage =
      getBrowserLanguage();

    const sourceLanguage =
      getSourceLanguage();


    /*
      Normally translate into the visitor's
      browser language.

      If browser and page languages are the same,
      use English as a neutral initial target.
      Google Translate itself allows the visitor
      to select another language afterwards.
    */

    if (
      browserLanguage
      && browserLanguage !== sourceLanguage
    ) {
      return browserLanguage;
    }


    if (sourceLanguage !== "en") {
      return "en";
    }


    return "ru";

  }


  function buildGoogleTranslateUrl() {

    const currentPage =
      window.location.href;

    const targetLanguage =
      getTargetLanguage();


    return (
      "https://translate.google.com/translate"
      + "?sl=auto"
      + "&tl="
      + encodeURIComponent(
          targetLanguage
        )
      + "&u="
      + encodeURIComponent(
          currentPage
        )
    );

  }


  translateLinks.forEach(
    function (link) {

      link.addEventListener(
        "click",
        function (event) {

          event.preventDefault();


          window.location.href =
            buildGoogleTranslateUrl();

        }
      );

    }
  );


})();
