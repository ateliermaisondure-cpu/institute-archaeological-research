/* =========================================================
   IAR NEWS FEED
   Institute of Archaeological Research
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     GOOGLE APPS SCRIPT WEB APP

     IMPORTANT:
     Keep the CURRENT Web App URL here.
     ======================================================= */

  const NEWS_FEED_URL =
    "https://script.google.com/macros/s/AKfycbxxlWBdlAq2lBOrIbPbE-E03aqq85_RaZI8pJOc0n7rCr0u-4h1cK9H2c86-OpMCBPN/exec";


  /* =======================================================
     PAGE ELEMENTS
     ======================================================= */

  const newsFeed =
    document.getElementById("news-feed");

  const newsTemplate =
    document.getElementById("news-card-template");

  const latestNewsHeading =
    document.getElementById("latest-news-heading");


  if (!newsFeed || !newsTemplate) {
    return;
  }


  /* =======================================================
     URL PARAMETER

     Example:
     news.html?id=N-20260813-E249D9
     ======================================================= */

  const urlParameters =
    new URLSearchParams(
      window.location.search
    );

  const requestedNewsId =
    urlParameters.get("id");
   const requestedView =
  urlParameters.get("view");


  /* =======================================================
     DATE FORMAT
     2026-08-13 → 13 August 2026
     ======================================================= */

  function formatDate(dateString) {

    if (!dateString) {
      return "";
    }

    const date =
      new Date(
        dateString + "T00:00:00"
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

    let match =
      url.match(
        /[?&]id=([^&]+)/
      );

    if (
      match
      && match[1]
    ) {
      return match[1];
    }

    match =
      url.match(
        /\/d\/([^/]+)/
      );

    if (
      match
      && match[1]
    ) {
      return match[1];
    }

    return "";

  }


  /* =======================================================
     IMAGE URL
     ======================================================= */

  function getImageUrl(photoUrl) {

    const fileId =
      getDriveFileId(
        photoUrl
      );

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
     CREATE ONE FULL NEWS CARD
     ======================================================= */

  function createNewsCard(item) {

    const fragment =
      newsTemplate
        .content
        .cloneNode(true);

    const card =
      fragment.querySelector(
        ".news-card"
      );


    /* FEATURED */

    if (item.featured) {
      card.classList.add(
        "featured"
      );
    }


    /* DATE */

    const dateElement =
      fragment.querySelector(
        ".news-date"
      );

    const displayDate =
      item.publicationDate
      || item.eventDate
      || "";

    if (displayDate) {

      dateElement.textContent =
        formatDate(
          displayDate
        );

      dateElement.setAttribute(
        "datetime",
        displayDate
      );

    } else {

      dateElement.remove();

    }


    /* UNIT */

    const unitElement =
      fragment.querySelector(
        ".news-unit"
      );

    if (item.unit) {

      unitElement.textContent =
        item.unit;

    } else {

      unitElement.remove();

    }


    /* TITLE */

    const titleElement =
      fragment.querySelector(
        ".news-title"
      );

    titleElement.textContent =
      item.title || "";


    /* SUMMARY */

    const summaryElement =
      fragment.querySelector(
        ".news-summary"
      );

    if (item.summary) {

      summaryElement.textContent =
        item.summary;

    } else {

      summaryElement.remove();

    }


    /* FULL TEXT */

    const fullTextElement =
      fragment.querySelector(
        ".news-full-text"
      );

    if (item.fullText) {

      fullTextElement.textContent =
        item.fullText;

      fullTextElement.hidden =
        false;

    } else {

      fullTextElement.remove();

    }


    /* EXTERNAL LINK */

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


  const isYouTube =
    /(?:youtube\.com|youtu\.be)/i.test(
      item.externalLink
    );


  if (item.linkText) {

    linkLabel.textContent =
      item.linkText;

  } else if (isYouTube) {

    linkLabel.textContent =
      "Watch video on YouTube";

    externalLink.classList.add(
      "news-video-link"
    );

  } else {

    linkLabel.textContent =
      "Read more";

  }

} else {

  externalLink.remove();

}


    /* PHOTO */

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
        getImageUrl(
          item.photo
        );

      image.alt =
        item.photoCaption
        || item.title
        || "News image";


      image.addEventListener(
        "error",
        function () {

          figure.remove();

          card.classList.add(
            "no-image"
          );

        }
      );


      /* PHOTO CAPTION */

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
     CREATE EARLIER NEWS
     ======================================================= */
function createEarlierNews(items) {

  if (
    !Array.isArray(items)
    || items.length === 0
  ) {
    return null;
  }


  const section =
    document.createElement(
      "section"
    );

  section.className =
    "earlier-news";


  const heading =
    document.createElement(
      "h3"
    );

  heading.className =
    "earlier-news-heading";

  heading.textContent =
    "Earlier News";

  section.appendChild(
    heading
  );


  const list =
    document.createElement(
      "div"
    );

  list.className =
    "earlier-news-list";


  const visibleItems =
    items.slice(
      0,
      3
    );


  visibleItems.forEach(
    function (item) {

      const link =
        document.createElement(
          "a"
        );

      link.className =
        "earlier-news-item";

      link.href =
        "news.html?id="
        + encodeURIComponent(
            item.id
          );


      const date =
        document.createElement(
          "time"
        );

      date.className =
        "earlier-news-date";

      const displayDate =
        item.publicationDate
        || item.eventDate
        || "";

      date.textContent =
        formatDate(
          displayDate
        );

      if (displayDate) {

        date.setAttribute(
          "datetime",
          displayDate
        );

      }


      const content =
        document.createElement(
          "span"
        );

      content.className =
        "earlier-news-content";


      const title =
        document.createElement(
          "strong"
        );

      title.className =
        "earlier-news-title";

      title.textContent =
        item.title
        || "News";


      const unit =
        document.createElement(
          "span"
        );

      unit.className =
        "earlier-news-unit";

      unit.textContent =
        item.unit || "";


      content.appendChild(
        title
      );

      if (item.unit) {

        content.appendChild(
          unit
        );

      }


      const arrow =
        document.createElement(
          "span"
        );

      arrow.className =
        "earlier-news-arrow";

      arrow.setAttribute(
        "aria-hidden",
        "true"
      );

      arrow.textContent =
        "→";


      link.appendChild(
        date
      );

      link.appendChild(
        content
      );

      link.appendChild(
        arrow
      );

      list.appendChild(
        link
      );

    }
  );


  section.appendChild(
    list
  );


  if (items.length > 3) {

    const more =
      document.createElement(
        "div"
      );

    more.className =
      "earlier-news-more";


    const moreLink =
      document.createElement(
        "a"
      );

    moreLink.href =
      "news.html?view=archive";

    moreLink.className =
      "text-link";

    moreLink.textContent =
      "View all earlier news →";


    more.appendChild(
      moreLink
    );

    section.appendChild(
      more
    );

  }


  return section;

}


/* =======================================================
   FULL NEWS ARCHIVE
   ======================================================= */

function createArchiveList(items) {

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "news-archive-list";


  items.forEach(
    function (item) {

      const link =
        document.createElement(
          "a"
        );

      link.className =
        "news-archive-item";

      link.href =
        "news.html?id="
        + encodeURIComponent(
            item.id
          );


      const date =
        document.createElement(
          "time"
        );

      date.className =
        "news-archive-date";


      const displayDate =
        item.publicationDate
        || item.eventDate
        || "";


      date.textContent =
        formatDate(
          displayDate
        );


      if (displayDate) {

        date.setAttribute(
          "datetime",
          displayDate
        );

      }


      const content =
        document.createElement(
          "span"
        );

      content.className =
        "news-archive-content";


      const title =
        document.createElement(
          "strong"
        );

      title.className =
        "news-archive-title";

      title.textContent =
        item.title
        || "News";


      const unit =
        document.createElement(
          "span"
        );

      unit.className =
        "news-archive-unit";

      unit.textContent =
        item.unit || "";


      content.appendChild(
        title
      );


      if (item.unit) {

        content.appendChild(
          unit
        );

      }


      const arrow =
        document.createElement(
          "span"
        );

      arrow.className =
        "news-archive-arrow";

      arrow.setAttribute(
        "aria-hidden",
        "true"
      );

      arrow.textContent =
        "→";


      link.appendChild(
        date
      );

      link.appendChild(
        content
      );

      link.appendChild(
        arrow
      );


      list.appendChild(
        link
      );

    }
  );


  return list;

}

   
  /* =======================================================
     BACK TO ALL NEWS LINK
     ======================================================= */

  function createBackLink() {

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "news-back";


    const link =
      document.createElement(
        "a"
      );

    link.className =
      "text-link";

    link.href =
      "news.html";

    link.textContent =
      "← Back to all news";


    wrapper.appendChild(
      link
    );

    return wrapper;

  }


  /* =======================================================
     DISPLAY MAIN NEWS PAGE

     Maximum:
     2 full news items

     All older items:
     Earlier News
     ======================================================= */

  function renderNewsList(data) {

    newsFeed.innerHTML =
      "";


    const allNews =
      data.news;


    const latestNews =
      allNews.slice(
        0,
        2
      );


    const earlierNews =
      allNews.slice(
        2
      );


    latestNews.forEach(
      function (item) {

        newsFeed.appendChild(
          createNewsCard(
            item
          )
        );

      }
    );


    const earlierSection =
      createEarlierNews(
        earlierNews
      );


    if (earlierSection) {

      newsFeed.appendChild(
        earlierSection
      );

    }

  }

/* =======================================================
   DISPLAY NEWS ARCHIVE
   ======================================================= */

function renderArchive(data) {

  newsFeed.innerHTML =
    "";


  const archiveItems =
    data.news.slice(
      2
    );


  if (latestNewsHeading) {

    latestNewsHeading.textContent =
      "News Archive";

  }


  document.title =
    "News Archive | Institute of Archaeological Research";


  newsFeed.appendChild(
    createBackLink()
  );


  if (
    archiveItems.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );

    message.className =
      "news-loading";

    message.textContent =
      "There are no earlier news items yet.";

    newsFeed.appendChild(
      message
    );

    return;

  }


  newsFeed.appendChild(
    createArchiveList(
      archiveItems
    )
  );

}
  /* =======================================================
     DISPLAY ONE NEWS ITEM BY ID
     ======================================================= */

  function renderSingleNews(
    data,
    newsId
  ) {

    newsFeed.innerHTML =
      "";


    const item =
      data.news.find(
        function (newsItem) {

          return (
            newsItem.id
            === newsId
          );

        }
      );


    if (!item) {

      const message =
        document.createElement(
          "p"
        );

      message.className =
        "news-loading";

      message.textContent =
        "News item not found.";


      newsFeed.appendChild(
        createBackLink()
      );

      newsFeed.appendChild(
        message
      );

      return;

    }


    if (latestNewsHeading) {

      latestNewsHeading.textContent =
        "News";

    }


    document.title =
      (item.title || "News")
      + " | Institute of Archaeological Research";


    newsFeed.appendChild(
      createBackLink()
    );


    newsFeed.appendChild(
      createNewsCard(
        item
      )
    );

  }


  /* =======================================================
     DISPLAY DATA
     ======================================================= */

  function renderNews(data) {

    if (
      !data
      || data.ok !== true
    ) {

      newsFeed.innerHTML =
        '<p class="news-loading">'
        + 'News could not be loaded.'
        + '</p>';

      return;

    }


    if (
      !Array.isArray(
        data.news
      )
      || data.news.length === 0
    ) {

      newsFeed.innerHTML =
        '<p class="news-loading">'
        + 'No news has been published yet.'
        + '</p>';

      return;

    }


 if (requestedNewsId) {

  renderSingleNews(
    data,
    requestedNewsId
  );

} else if (
  requestedView === "archive"
) {

  renderArchive(
    data
  );

} else {

  renderNewsList(
    data
  );

}

  }


  /* =======================================================
     JSONP LOADER
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

        finished =
          true;

        cleanup();

        renderNews(
          data
        );

      };


    const separator =
      NEWS_FEED_URL.includes("?")
        ? "&"
        : "?";


    script.src =
      NEWS_FEED_URL
      + separator
      + "callback="
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

        finished =
          true;

        cleanup();

        newsFeed.innerHTML =
          '<p class="news-loading">'
          + 'News could not be loaded.'
          + '</p>';

      };


    document.body.appendChild(
      script
    );


    window.setTimeout(
      function () {

        if (finished) {
          return;
        }

        finished =
          true;

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
