/* =========================================================
   IAR NEWS FEED
   Institute of Archaeological Research
   ========================================================= */


(function () {

  "use strict";


  /* =======================================================
     GOOGLE APPS SCRIPT WEB APP

     Replace the address below with the exact Web App URL
     ending in /exec.
     ======================================================= */

  const NEWS_FEED_URL =
    "https://script.google.com/macros/s/AKfycbw4KLMTYZJ3fj4ukLysRoS4WSFFFgwHwrgJzxxzmnKB43b2aJPzl3X_9stex26G1rDw/exec";


  /* =======================================================
     PAGE ELEMENTS
     ======================================================= */

  const newsFeed =
    document.getElementById("news-feed");

  const newsTemplate =
    document.getElementById("news-card-template");


  if (!newsFeed || !newsTemplate) {
    return;
  }


  /* =======================================================
     DATE FORMAT
     2026-08-13 → 13 August 2026
     ======================================================= */

  function formatDate(dateString) {

    if (!dateString) {
      return "";
    }

    const date =
      new Date(dateString + "T00:00:00");


    if (Number.isNaN(date.getTime())) {
      return dateString;
    }


    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(date);

  }


  /* =======================================================
     GOOGLE DRIVE FILE ID
     ======================================================= */

  function getDriveFileId(url) {

    if (!url) {
      return "";
    }


    /*
      Example:
      https://drive.google.com/open?id=FILE_ID
    */

    let match =
      url.match(/[?&]id=([^&]+)/);

    if (match && match[1]) {
      return match[1];
    }


    /*
      Example:
      https://drive.google.com/file/d/FILE_ID/view
    */

    match =
      url.match(/\/d\/([^/]+)/);

    if (match && match[1]) {
      return match[1];
    }


    return "";

  }


  /* =======================================================
     IMAGE URL
     ======================================================= */

  function getImageUrl(photoUrl) {

    const fileId =
      getDriveFileId(photoUrl);


    if (fileId) {

      return (
        "https://drive.google.com/thumbnail?id="
        + encodeURIComponent(fileId)
        + "&sz=w1200"
      );

    }


    return photoUrl || "";

  }


  /* =======================================================
     CREATE ONE NEWS CARD
     ======================================================= */

  function createNewsCard(item) {

    const fragment =
      newsTemplate.content.cloneNode(true);

    const card =
      fragment.querySelector(".news-card");


    /* -------------------------------------------------------
       FEATURED
       ------------------------------------------------------- */

    if (item.featured) {
      card.classList.add("featured");
    }


    /* -------------------------------------------------------
       DATE
       ------------------------------------------------------- */

    const dateElement =
      fragment.querySelector(".news-date");

    const displayDate =
      item.publicationDate
      || item.eventDate
      || "";


    if (displayDate) {

      dateElement.textContent =
        formatDate(displayDate);

      dateElement.setAttribute(
        "datetime",
        displayDate
      );

    } else {

      dateElement.remove();

    }


    /* -------------------------------------------------------
       UNIT
       ------------------------------------------------------- */

    const unitElement =
      fragment.querySelector(".news-unit");


    if (item.unit) {

      unitElement.textContent =
        item.unit;

    } else {

      unitElement.remove();

    }


    /* -------------------------------------------------------
       TITLE
       ------------------------------------------------------- */

    const titleElement =
      fragment.querySelector(".news-title");

    titleElement.textContent =
      item.title || "";


    /* -------------------------------------------------------
       SHORT SUMMARY
       ------------------------------------------------------- */

    const summaryElement =
      fragment.querySelector(".news-summary");


    if (item.summary) {

      summaryElement.textContent =
        item.summary;

    } else {

      summaryElement.remove();

    }


    /* -------------------------------------------------------
       FULL TEXT
       ------------------------------------------------------- */

    const fullTextElement =
      fragment.querySelector(".news-full-text");


    if (item.fullText) {

      fullTextElement.textContent =
        item.fullText;

      fullTextElement.hidden = false;

    } else {

      fullTextElement.remove();

    }


    /* -------------------------------------------------------
       EXTERNAL LINK
       ------------------------------------------------------- */

    const externalLink =
      fragment.querySelector(
        ".news-external-link"
      );


    if (item.externalLink) {

      externalLink.href =
        item.externalLink;

      externalLink.hidden =
        false;


      const linkLabel =
        fragment.querySelector(
          ".news-link-label"
        );


      linkLabel.textContent =
        item.linkText
        || "Read more";

    } else {

      externalLink.remove();

    }


    /* -------------------------------------------------------
       PHOTO
       ------------------------------------------------------- */

    const figure =
      fragment.querySelector(
        ".news-card-image"
      );

    const image =
      fragment.querySelector(
        ".news-card-image img"
      );


    if (item.photo) {

      image.src =
        getImageUrl(item.photo);

      image.alt =
        item.photoCaption
        || item.title
        || "News image";


      /*
        If Google Drive does not allow the image
        to be displayed publicly, remove the image
        but keep the news card.
      */

      image.addEventListener(
        "error",
        function () {

          figure.remove();

          card.classList.add(
            "no-image"
          );

        }
      );


      /* Caption */

      const caption =
        fragment.querySelector(
          ".news-photo-caption"
        );

      const credit =
        fragment.querySelector(
          ".news-photo-credit"
        );

      const figcaption =
        fragment.querySelector(
          ".news-image-caption"
        );


      if (item.photoCaption) {

        caption.textContent =
          item.photoCaption;

      } else {

        caption.remove();

      }


      if (item.photoCredit) {

        credit.textContent =
          item.photoCredit;

      } else {

        credit.remove();

      }


      if (
        !item.photoCaption
        && !item.photoCredit
      ) {

        figcaption.remove();

      }

    } else {

      figure.remove();

      card.classList.add(
        "no-image"
      );

    }


    return fragment;

  }


  /* =======================================================
     DISPLAY NEWS
     ======================================================= */

  function renderNews(data) {

    newsFeed.innerHTML = "";


    if (
      !data
      || data.ok !== true
    ) {

      const message =
        document.createElement("p");

      message.className =
        "news-loading";

      message.textContent =
        "News could not be loaded.";

      newsFeed.appendChild(
        message
      );

      return;

    }


    if (
      !Array.isArray(data.news)
      || data.news.length === 0
    ) {

      const message =
        document.createElement("p");

      message.className =
        "news-loading";

      message.textContent =
        "No news has been published yet.";

      newsFeed.appendChild(
        message
      );

      return;

    }


    data.news.forEach(
      function (item) {

        newsFeed.appendChild(
          createNewsCard(item)
        );

      }
    );

  }


  /* =======================================================
     JSONP
     Loads the public feed from Google Apps Script
     ======================================================= */

  function loadNews() {

    if (
      !NEWS_FEED_URL
      || NEWS_FEED_URL.includes(
        "PASTE_YOUR"
      )
    ) {

      newsFeed.innerHTML =
        '<p class="news-loading">'
        + 'News feed URL has not been configured.'
        + '</p>';

      return;

    }


    const callbackName =
      "iarNewsCallback_"
      + Date.now();


    const script =
      document.createElement(
        "script"
      );


    let finished =
      false;


    function cleanup() {

      if (script.parentNode) {
        script.parentNode.removeChild(
          script
        );
      }

      try {
        delete window[
          callbackName
        ];
      } catch (error) {
        window[
          callbackName
        ] = undefined;
      }

    }


    window[
      callbackName
    ] =
      function (data) {

        finished = true;

        cleanup();

        renderNews(data);

      };


    script.src =
      NEWS_FEED_URL
      + "?callback="
      + encodeURIComponent(
          callbackName
        )
      + "&t="
      + Date.now();


    script.onerror =
      function () {

        if (finished) {
          return;
        }

        finished = true;

        cleanup();

        newsFeed.innerHTML =
          '<p class="news-loading">'
          + 'News could not be loaded.'
          + '</p>';

      };


    document.body.appendChild(
      script
    );


    /*
      Stop waiting after 15 seconds.
    */

    window.setTimeout(
      function () {

        if (finished) {
          return;
        }

        finished = true;

        cleanup();

        newsFeed.innerHTML =
          '<p class="news-loading">'
          + 'News could not be loaded.'
          + '</p>';

      },
      15000
    );

  }


  /* =======================================================
     START
     ======================================================= */

  loadNews();


})();
