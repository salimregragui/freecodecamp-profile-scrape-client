import axios from "axios";
import { useEffect, useState } from "react";
import "./App.scss";
import SQLI_REQUIRED from "./sqli-challenges.json";

function App() {
  const [search, setSearch] = useState("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileChallenges, setProfileChallenges] = useState([]);
  const [requiredChallenges, setRequiredChallenges] = useState([]);
  const [progress, setProgress] = useState(0);
  const [requiredChallengesCurrentPage, setRequiredChallengesCurrentPage] =
    useState(1);
  const [profileChallengesCurrentPage, setProfileChallengesCurrentPage] =
    useState(1);

  const [filter, setFilter] = useState("all");
  const [searchProfileChallenges, setSearchProfileChallenges] = useState("");

  const useSqliRequiredHandler = () => {
    const newRequiredChallenges = [];
    SQLI_REQUIRED.forEach((req) => {
      req.challenges.forEach((challenge) => {
        newRequiredChallenges.push({
          name: challenge,
          topic: req.topic,
          link:
            req.link +
            challenge
              .toLowerCase()
              .replaceAll(" ", "-")
              .replaceAll("@", "")
              .replaceAll("()", ""),
        });
      });
    });

    setRequiredChallenges([...newRequiredChallenges]);
  };

  const searchHandler = (e) => {
    e.preventDefault();

    if (search.trim() !== "") {
      setLoading(true);
      axios
        .get("http://localhost:5000/api/search/" + search)
        .then((result) => {
          setProfileChallenges([...result.data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const addChallengeHandler = (e) => {
    e.preventDefault();

    if (challenge.trim() !== "") {
      const currentRequiredChallenges = [...requiredChallenges];

      currentRequiredChallenges.push({
        name: challenge.trim(),
      });

      setRequiredChallenges([...currentRequiredChallenges]);
      setChallenge("");
    }
  };

  useEffect(() => {
    if (requiredChallenges.length > 0 && profileChallenges.length > 0) {
      const notDoneYet = requiredChallenges.filter(
        (x) => !profileChallenges.some((item) => item.name === x.name)
      );

      const progressCalculation = Math.ceil(
        ((requiredChallenges.length - notDoneYet.length) * 100) /
          requiredChallenges.length
      );

      setProgress(progressCalculation);
    }
  }, [requiredChallenges, profileChallenges]);

  const getRequiredChallenges = () => {
    if (filter === "all") {
      return requiredChallenges;
    } else if (filter === "notDone") {
      return requiredChallenges.filter(
        (rc) => !profileChallenges.some((pc) => pc.name === rc.name)
      );
    } else if (filter === "done") {
      return requiredChallenges.filter((rc) =>
        profileChallenges.some((pc) => pc.name === rc.name)
      );
    }
  };

  const searchProfileHandler = (e) => {
    setSearchProfileChallenges(e.target.value);
  };

  return (
    <div className="App">
      <div className="Topbar">
        <li className="Logo">
          FCC Profile Scrapper
          <span>By Salim Regragui</span>
        </li>

        <li className="SearchBar">
          <form onSubmit={searchHandler}>
            <input
              type="text"
              value={search}
              placeholder="Search for a profile to check progress"
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </li>

        <li className="Progress">
          {requiredChallenges.length > 0 && profileChallenges.length > 0 ? (
            <>
              <span className="ProgressText">{progress}%</span>
              <span className="ProgressCircle">
                <span
                  className="ProgressCircleTop"
                  style={{ width: progress + "%" }}
                ></span>
              </span>
            </>
          ) : (
            <span>No data available yet !</span>
          )}
        </li>
      </div>

      <div className="Content">
        <div className="RequiredChallenges">
          <h1>Required challenges</h1>
          <form onSubmit={addChallengeHandler}>
            <input
              type="text"
              value={challenge}
              placeholder="Add a required challenge (link or title)"
              onChange={(e) => setChallenge(e.target.value)}
            />
            <button type="button" onClick={useSqliRequiredHandler}>
              Use SQLI guide
            </button>
          </form>

          <div className="filters">
            <button
              className={filter === "notDone" ? "selected" : ""}
              type="button"
              onClick={() => setFilter("notDone")}
            >
              Show only not done
            </button>

            <button
              className={filter === "done" ? "selected" : ""}
              type="button"
              onClick={() => setFilter("done")}
            >
              Show only done
            </button>

            <button
              className={filter === "all" ? "selected" : ""}
              type="button"
              onClick={() => setFilter("all")}
            >
              Show all
            </button>
          </div>

          <ul className="RequiredChallengesList">
            {requiredChallenges.length > 0 ? (
              <>
                {getRequiredChallenges()
                  .slice(
                    (requiredChallengesCurrentPage - 1) * 10,
                    requiredChallengesCurrentPage * 10
                  )
                  .map((rc) => (
                    <li key={rc.name} className="RequiredChallengeItem">
                      <div className="RequiredChallengeItemInfos">
                        <a href={rc.link} target="_blank">{rc.name}</a>
                        <span>{rc.topic}</span>
                      </div>
                      {profileChallenges.some((pc) => pc.name === rc.name) ? (
                        <span className="RequiredChallengeDone">
                          <svg
                            className="w-6 h-6"
                            style={{ width: "14px", height: "14px" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </li>
                  ))}
                <div className="pagination">
                  <button
                    className="paginationButton"
                    type="button"
                    onClick={() => {
                      if (requiredChallengesCurrentPage > 1)
                        setRequiredChallengesCurrentPage(
                          requiredChallengesCurrentPage - 1
                        );
                    }}
                  >
                    <svg
                      className="w-2 h-2"
                      style={{ width: "20px", height: "20px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span>
                    {requiredChallengesCurrentPage} /{" "}
                    {Math.ceil(requiredChallenges.length / 10)}
                  </span>
                  <button
                    className="paginationButton"
                    type="button"
                    onClick={() => {
                      if (
                        requiredChallengesCurrentPage <
                        Math.ceil(requiredChallenges.length / 10)
                      ) {
                        setRequiredChallengesCurrentPage(
                          requiredChallengesCurrentPage + 1
                        );
                      }
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ width: "20px", height: "20px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <span className="noData">No challenges required yet !</span>
            )}
          </ul>
        </div>

        <div className="ProfileChallenges">
          {loading ? (
            <div className="LoadingScreen">
              <div className="ldsRing">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span>
                Retrieving profile data from server. Please wait a moment...
              </span>
            </div>
          ) : (
            <>
              <h1>
                <span>All challenges done by {search}</span>
                <input
                  type="text"
                  value={searchProfileChallenges}
                  placeholder="Search in your profile..."
                  onChange={searchProfileHandler}
                />
              </h1>

              <ul className="ProfileChallengesList">
                {profileChallenges.length > 0 ? (
                  <>
                    {profileChallenges
                      .slice(
                        (profileChallengesCurrentPage - 1) * 10,
                        profileChallengesCurrentPage * 10
                      )
                      .map((pc) => (
                        <li key={pc.name} className="ProfileChallengeItem">
                          <a href={pc.link} target="_blank">
                            {pc.name}
                          </a>
                          <span>{pc.date}</span>
                        </li>
                      ))}
                    <div className="pagination">
                      <button
                        className="paginationButton"
                        type="button"
                        onClick={() => {
                          console.log(
                            profileChallengesCurrentPage +
                              " " +
                              Math.ceil(profileChallenges.length / 10)
                          );
                          if (profileChallengesCurrentPage > 1)
                            setProfileChallengesCurrentPage(
                              profileChallengesCurrentPage - 1
                            );
                        }}
                      >
                        <svg
                          className="w-2 h-2"
                          style={{ width: "20px", height: "20px" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <span>
                        {profileChallengesCurrentPage} /{" "}
                        {Math.ceil(profileChallenges.length / 10)}
                      </span>
                      <button
                        className="paginationButton"
                        type="button"
                        onClick={() => {
                          console.log(
                            profileChallengesCurrentPage +
                              " " +
                              Math.ceil(profileChallenges.length / 10)
                          );
                          if (
                            profileChallengesCurrentPage <
                            Math.ceil(profileChallenges.length / 10)
                          ) {
                            setProfileChallengesCurrentPage(
                              profileChallengesCurrentPage + 1
                            );
                          }
                        }}
                      >
                        <svg
                          className="w-6 h-6"
                          style={{ width: "20px", height: "20px" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="noData">
                    No challenges done or retrieved yet !
                  </span>
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
