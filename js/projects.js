/* =========================================================
   IAR RESEARCH PROJECTS
   Institute of Archaeological Research
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     GOOGLE APPS SCRIPT WEB APP
     ======================================================= */

  const PROJECTS_FEED_URL =
    "https://script.google.com/macros/s/AKfycbzFoF9N21r-970L1xjVHBoN7nwVGYYYEpMOw_9lzKTAiM0xnzI-3TtftFlxC-UTWN0xpQ/exec";


  /* =======================================================
     PAGE ELEMENTS
     ======================================================= */

  const projectsFeed =
    document.getElementById(
      "projects-feed"
    );

  const projectTemplate =
    document.getElementById(
      "project-card-template"
    );

  const latestProjectsHeading =
    document.getElementById(
      "latest-projects-heading"
    );


  if (
    !projectsFeed
    || !projectTemplate
  ) {
    return;
  }


  /* =======================================================
     URL PARAMETERS

     research_projects.html?id=PRJ-...
     research_projects.html?view=archive
     ======================================================= */

  const urlParameters =
    new URLSearchParams(
      window.location.search
    );

  const requestedProjectId =
    urlParameters.get("id");

  const requestedView =
    urlParameters.get("view");


  /* =======================================================
     DATE FORMAT
     ======================================================= */

  function formatDate(dateString) {

    if (!dateString) {
      return "";
    }


    const date =
      new Date(
        dateString
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
     GOOGLE DRIVE IMAGE
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
     YOUTUBE VIDEO
     ======================================================= */

  function getYouTubeVideoId(url) {

    if (!url) {
      return "";
    }


    let match =
      url.match(
        /youtu\.be\/([^?&/]+)/
      );


    if (
      match
      && match[1]
    ) {
      return match[1];
    }


    match =
      url.match(
        /youtube\.com\/watch\?.*[?&]v=([^&]+)/
      );


    if (
      match
      && match[1]
    ) {
      return match[1];
    }


    match =
      url.match(
        /youtube\.com\/shorts\/([^?&/]+)/
      );


    if (
      match
      && match[1]
    ) {
      return match[1];
    }


    match =
      url.match(
        /youtube\.com\/embed\/([^?&/]+)/
      );


    if (
      match
      && match[1]
    ) {
      return match[1];
    }


    return "";

  }


  function getYouTubeThumbnail(url) {

    const videoId =
      getYouTubeVideoId(
        url
      );


    if (!videoId) {
      return "";
    }


    return (
      "https://i.ytimg.com/vi/"
      + encodeURIComponent(videoId)
      + "/hqdefault.jpg"
    );

  }


  /* =======================================================
     CHRONOLOGICAL SORTING

     Two most recently published projects always
     appear first, just like the News page.
     ======================================================= */

  function sortProjectsByDate(projects) {

    return projects
      .slice()
      .sort(
        function (a, b) {

          const dateA =
            Date.parse(
              a.publicationDate
            ) || 0;

          const dateB =
            Date.parse(
              b.publicationDate
            ) || 0;


          return dateB - dateA;

        }
      );

  }


  /* =======================================================
     PROJECT DETAIL ROW
     ======================================================= */

  function createProjectDetail(
    label,
    value
  ) {

    if (
      value === null
      || value === undefined
      || String(value).trim() === ""
    ) {
      return null;
    }


    const row =
      document.createElement(
        "div"
      );

    row.className =
      "project-detail";


    const term =
      document.createElement(
        "span"
      );

    term.className =
      "project-detail-label";

    term.textContent =
      label;


    const content =
      document.createElement(
        "span"
      );

    content.className =
      "project-detail-value";

    content.textContent =
      value;


    row.appendChild(
      term
    );

    row.appendChild(
      content
    );


    return row;

  }


  /* =======================================================
     FEATURED VALUE
     ======================================================= */

  function isFeatured(value) {

    if (value === true) {
      return true;
    }


    if (!value) {
      return false;
    }


    return (
      String(value)
        .trim()
        .toLowerCase()
      === "yes"
    );

  }


  /* =======================================================
     CREATE ONE FULL PROJECT CARD
     ======================================================= */

  function createProjectCard(
    item,
    fullDetails
  ) {

    const fragment =
      projectTemplate
        .content
        .cloneNode(true);


    const card =
      fragment.querySelector(
        ".news-card"
      );


    card.classList.add(
      "project-card"
    );


    if (fullDetails) {

      card.classList.add(
        "single-project"
      );

    }


    if (
      isFeatured(
        item.featured
      )
    ) {

      card.classList.add(
        "featured"
      );

    }


    /* DATE */

    const dateElement =
      fragment.querySelector(
        ".news-date"
      );


    if (
      dateElement
      && item.publicationDate
    ) {

      dateElement.textContent =
        formatDate(
          item.publicationDate
        );

      dateElement.setAttribute(
        "datetime",
        item.publicationDate
      );

    } else if (dateElement) {

      dateElement.remove();

    }


    /* UNIT */

    const unitElement =
      fragment.querySelector(
        ".news-unit"
      );


    if (
      unitElement
      && item.unit
    ) {

      unitElement.textContent =
        item.unit;

    } else if (unitElement) {

      unitElement.remove();

    }


    /* TITLE */

    const titleElement =
      fragment.querySelector(
        ".news-title"
      );


    titleElement.textContent =
      item.title
      || item.shortTitle
      || "Research Project";


    /* BASIC PROJECT DETAILS */

    const details =
      document.createElement(
        "div"
      );

    details.className =
      "project-details";


    const basicDetails = [

      [
        "Status",
        item.projectStatus
      ],

      [
        "Project period",
        item.period
      ],

      [
        "Project lead",
        item.lead
      ]

    ];


    basicDetails.forEach(
      function (detail) {

        const row =
          createProjectDetail(
            detail[0],
            detail[1]
          );


        if (row) {

          details.appendChild(
            row
          );

        }

      }
    );


    if (
      details.children.length
    ) {

      titleElement.insertAdjacentElement(
        "afterend",
        details
      );

    }


    /* SHORT SUMMARY */

    const summaryElement =
      fragment.querySelector(
        ".news-summary"
      );


    if (
      summaryElement
      && item.summary
    ) {

      summaryElement.textContent =
        item.summary;

    } else if (summaryElement) {

      summaryElement.remove();

    }


    /* OLD FULL DESCRIPTION FIELD IS NO LONGER USED */

    const fullTextElement =
      fragment.querySelector(
        ".news-full-text"
      );


    if (fullTextElement) {

      fullTextElement.remove();

    }


    /* =====================================================
       ADDITIONAL PUBLIC PROJECT DETAILS

       These fields are shown on Latest Projects
       and on the individual project page.
       Empty fields are automatically omitted.
       ===================================================== */

    const extendedDetails =
      document.createElement(
        "div"
      );

    extendedDetails.className =
      "project-extended-details";


    const additionalFields = [

      [
        "Project team",
        item.team
      ],

      [
        "Funding / Support",
        item.funding
      ],

      [
        "Partner institutions",
        item.partners
      ],

      [
        "Geographic scope",
        item.geography
      ],

      [
        "Key results",
        item.keyResults
      ]

    ];


    additionalFields.forEach(
      function (field) {

        const row =
          createProjectDetail(
            field[0],
            field[1]
          );


        if (row) {

          extendedDetails.appendChild(
            row
          );

        }

      }
    );


    if (
      extendedDetails.children.length
    ) {

      const externalLinkPosition =
        fragment.querySelector(
          ".news-external-link"
        );


      if (externalLinkPosition) {

        externalLinkPosition.insertAdjacentElement(
          "beforebegin",
          extendedDetails
        );

      } else {

        const content =
          fragment.querySelector(
            ".news-card-content"
          );


        if (content) {

          content.appendChild(
            extendedDetails
          );

        }

      }

    }


    /* EXTERNAL LINK */

    const externalLink =
      fragment.querySelector(
        ".news-external-link"
      );


    if (
      externalLink
      && item.externalLink
    ) {

      externalLink.href =
        item.externalLink;

      externalLink.target =
        "_blank";

      externalLink.rel =
        "noopener noreferrer";

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


      if (linkLabel) {

        if (isYouTube) {

          linkLabel.textContent =
            "Watch video on YouTube";

        } else if (item.linkText) {

          linkLabel.textContent =
            item.linkText;

        } else {

          linkLabel.textContent =
            "Read more";

        }

      }

    } else if (externalLink) {

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


    const youtubeThumbnail =
      getYouTubeThumbnail(
        item.externalLink
      );


    const displayPhoto =
      item.photo
        ? getImageUrl(
            item.photo
          )
        : youtubeThumbnail;


    if (
      figure
      && image
      && displayPhoto
    ) {

      image.src =
        displayPhoto;


      image.alt =
        item.photoCaption
        || item.title
        || "Project image";


      image.addEventListener(
        "error",
        function () {

          figure.remove();

          card.classList.add(
            "no-image"
          );

        }
      );


      /* Make YouTube thumbnail clickable */

      if (
        !item.photo
        && youtubeThumbnail
        && item.externalLink
      ) {

        const youtubeLink =
          document.createElement(
            "a"
          );

        youtubeLink.href =
          item.externalLink;

        youtubeLink.target =
          "_blank";

        youtubeLink.rel =
          "noopener noreferrer";

        youtubeLink.className =
          "news-youtube-thumbnail-link";


        image.parentNode.insertBefore(
          youtubeLink,
          image
        );

        youtubeLink.appendChild(
          image
        );

      }


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


      if (
        caption
        && item.photoCaption
      ) {

        caption.textContent =
          item.photoCaption;

      } else if (caption) {

        caption.remove();

      }


      if (
        credit
        && item.photoCredit
      ) {

        credit.textContent =
          item.photoCredit;

      } else if (credit) {

        credit.remove();

      }


      if (
        figcaption
        && !item.photoCaption
        && !item.photoCredit
      ) {

        figcaption.remove();

      }

    } else {

      if (figure) {

        figure.remove();

      }

      card.classList.add(
        "no-image"
      );

    }


    return fragment;

  }


  /* =======================================================
     EARLIER PROJECTS
     ======================================================= */

  function createEarlierProjects(items) {

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
      "earlier-news earlier-projects";


    const heading =
      document.createElement(
        "h3"
      );

    heading.className =
      "earlier-news-heading";

    heading.textContent =
      "Earlier Projects";


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
          "research_projects.html?id="
          + encodeURIComponent(
              item.id
            );


        const date =
          document.createElement(
            "time"
          );

        date.className =
          "earlier-news-date";


        date.textContent =
          formatDate(
            item.publicationDate
          );


        if (item.publicationDate) {

          date.setAttribute(
            "datetime",
            item.publicationDate
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
          item.shortTitle
          || item.title
          || "Research Project";


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
        "research_projects.html?view=archive";

      moreLink.className =
        "text-link";

      moreLink.textContent =
        "View all earlier projects →";


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
     PROJECTS ARCHIVE LIST
     ======================================================= */

  function createProjectsArchiveList(
    items
  ) {

    const list =
      document.createElement(
        "div"
      );

    list.className =
      "news-archive-list projects-archive-list";


    items.forEach(
      function (item) {

        const link =
          document.createElement(
            "a"
          );

        link.className =
          "news-archive-item";

        link.href =
          "research_projects.html?id="
          + encodeURIComponent(
              item.id
            );


        const date =
          document.createElement(
            "time"
          );

        date.className =
          "news-archive-date";

        date.textContent =
          formatDate(
            item.publicationDate
          );


        if (item.publicationDate) {

          date.setAttribute(
            "datetime",
            item.publicationDate
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
          item.shortTitle
          || item.title
          || "Research Project";


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
     BACK LINK
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
      "research_projects.html";

    link.textContent =
      "← Back to all projects";


    wrapper.appendChild(
      link
    );


    return wrapper;

  }


  /* =======================================================
     MAIN PROJECTS PAGE
     ======================================================= */

  function renderProjectsList(data) {

    projectsFeed.innerHTML =
      "";


    const allProjects =
      sortProjectsByDate(
        data.projects
      );


    const latestProjects =
      allProjects.slice(
        0,
        2
      );


    const earlierProjects =
      allProjects.slice(
        2
      );


    latestProjects.forEach(
      function (item) {

        projectsFeed.appendChild(
          createProjectCard(
            item,
            false
          )
        );

      }
    );


    const earlierSection =
      createEarlierProjects(
        earlierProjects
      );


    if (earlierSection) {

      projectsFeed.appendChild(
        earlierSection
      );

    }

  }


  /* =======================================================
     PROJECTS ARCHIVE
     ======================================================= */

  function renderProjectsArchive(
    data
  ) {

    projectsFeed.innerHTML =
      "";


    const allProjects =
      sortProjectsByDate(
        data.projects
      );


    const archiveItems =
      allProjects.slice(
        2
      );


    if (latestProjectsHeading) {

      latestProjectsHeading.textContent =
        "Projects Archive";

    }


    document.title =
      "Projects Archive | Institute of Archaeological Research";


    projectsFeed.appendChild(
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
        "There are no earlier projects yet.";


      projectsFeed.appendChild(
        message
      );

      return;

    }


    projectsFeed.appendChild(
      createProjectsArchiveList(
        archiveItems
      )
    );

  }


  /* =======================================================
     SINGLE PROJECT BY ID
     ======================================================= */

  function renderSingleProject(
    data,
    projectId
  ) {

    projectsFeed.innerHTML =
      "";


    const item =
      data.projects.find(
        function (project) {

          return (
            project.id === projectId
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
        "Project not found.";


      projectsFeed.appendChild(
        createBackLink()
      );

      projectsFeed.appendChild(
        message
      );

      return;

    }


    if (latestProjectsHeading) {

      latestProjectsHeading.textContent =
        "Research Project";

    }


    document.title =
      (item.title || "Research Project")
      + " | Institute of Archaeological Research";


    projectsFeed.appendChild(
      createBackLink()
    );


    projectsFeed.appendChild(
      createProjectCard(
        item,
        true
      )
    );

  }


  /* =======================================================
     DISPLAY DATA
     ======================================================= */

  function renderProjects(data) {

    if (
      !data
      || data.ok !== true
    ) {

      projectsFeed.innerHTML =
        '<p class="news-loading">'
        + 'Projects could not be loaded.'
        + '</p>';

      return;

    }


    if (
      !Array.isArray(
        data.projects
      )
      || data.projects.length === 0
    ) {

      projectsFeed.innerHTML =
        '<p class="news-loading">'
        + 'No projects have been published yet.'
        + '</p>';

      return;

    }


    if (requestedProjectId) {

      renderSingleProject(
        data,
        requestedProjectId
      );

    } else if (
      requestedView === "archive"
    ) {

      renderProjectsArchive(
        data
      );

    } else {

      renderProjectsList(
        data
      );

    }

  }


  /* =======================================================
     JSONP LOADER
     ======================================================= */

  function loadProjects() {

    const callbackName =
      "iarProjectsCallback_"
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

        renderProjects(
          data
        );

      };


    const separator =
      PROJECTS_FEED_URL.includes("?")
        ? "&"
        : "?";


    script.src =
      PROJECTS_FEED_URL
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


        projectsFeed.innerHTML =
          '<p class="news-loading">'
          + 'Projects could not be loaded.'
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


        projectsFeed.innerHTML =
          '<p class="news-loading">'
          + 'Projects could not be loaded.'
          + '</p>';

      },
      15000
    );

  }


  /* =======================================================
     START
     ======================================================= */

  loadProjects();


})();
