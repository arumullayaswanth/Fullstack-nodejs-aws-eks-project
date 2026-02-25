import React from "react";

const links = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/yaswanth-arumulla/",
    label: "in",
    className: "linkedin",
  },
  {
    name: "GitHub",
    href: "https://github.com/arumullayaswanth",
    label: "GH",
    className: "github",
  },
  {
    name: "Medium",
    href: "https://medium.com/@yaswanth.arumulla",
    label: "M",
    className: "medium",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@Yashacademy0",
    label: "YT",
    className: "youtube",
  },
];

const SocialLinks = () => {
  return (
    <footer className="social-footer">
      <div className="eyebrow">Follow Yash Academic</div>
      <p className="contrib-note">
        Explore our GitHub repository and access the source code:{" "}
        <a
          className="repo-link"
          href="https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          Yash Academic Bookstore on GitHub
        </a>
        . If you want to contribute, you are welcome to contribute and create a pull request.
      </p>
      <div className="social-row">
        {links.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-btn ${item.className}`}
            aria-label={item.name}
            title={item.name}
          >
            <span className="social-logo">{item.label}</span>
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    </footer>
  );
};

export default SocialLinks;
