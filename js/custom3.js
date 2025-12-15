let movieBoard = document.querySelector("#movieBoard");
let apikey = "bcc95f902b9e7bea00751d293dfa4562";
let moreBtn = document.querySelector("#movie");

let currentCategory = "now_playing";
let currentPage = 1;

// 페이지 로드시 모달 HTML 추가
document.addEventListener("DOMContentLoaded", () => {
  const modalHTML = `
    <div class="trailer-modal" id="trailerModal">
      <div class="modal-content">
        <button class="close-modal" onclick="closeTrailer()">✕</button>
        <div class="trailer-container" id="trailerContainer"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
});

let movie = async (lists) => {
  currentCategory = lists;
  currentPage = 1;
  movieBoard.innerHTML = "";

  let url = `https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${currentPage}`;

  let response = await fetch(url);
  let data = await response.json();

  let movieList = data.results;
  console.log(movieList);

  render(movieList);

  moreBtn.style.display = "block";
};

// 더보기 버튼 기능
moreBtn.addEventListener("click", async () => {
  currentPage++;

  let url = `https://api.themoviedb.org/3/movie/${currentCategory}?api_key=${apikey}&language=ko-KR&page=${currentPage}`;

  try {
    let response = await fetch(url);
    let data = await response.json();
    let movieList = data.results;

    renderMore(movieList);

    if (currentPage >= data.total_pages) {
      moreBtn.style.display = "none";
    }
  } catch (error) {
    console.log("에러 발생:", error);
    alert("영화를 불러오는 중 오류가 발생했습니다.");
  }
});

movie("now_playing");

// 줄거리 150자로 제한하는 함수
function truncateText(text, maxLength = 150) {
  if (!text) return "줄거리 정보가 없습니다.";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// 예고편 열기 함수
async function openTrailer(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apikey}&language=ko-KR`
    );
    const data = await response.json();

    let trailer = data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // 한국어 예고편이 없으면 영어로 재검색
    if (!trailer) {
      const responseEn = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apikey}&language=en-US`
      );
      const dataEn = await responseEn.json();
      trailer = dataEn.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
    }

    if (trailer) {
      const modal = document.getElementById("trailerModal");
      const container = document.getElementById("trailerContainer");

      container.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" 
          allow="autoplay; encrypted-media" 
          allowfullscreen>
        </iframe>
      `;

      modal.classList.add("active");
    } else {
      alert("예고편을 찾을 수 없습니다 😢");
    }
  } catch (error) {
    console.error("예고편 로딩 실패:", error);
    alert("예고편을 불러올 수 없습니다");
  }
}

// 예고편 닫기 함수
function closeTrailer() {
  const modal = document.getElementById("trailerModal");
  const container = document.getElementById("trailerContainer");

  container.innerHTML = "";
  modal.classList.remove("active");
}

// ESC 키로 모달 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTrailer();
});

// 모달 배경 클릭시 닫기
document.addEventListener("click", (e) => {
  if (e.target.id === "trailerModal") closeTrailer();
});

// 카드에 호버 이벤트 추가 (자동 모달 열기)
function addHoverEvent(card, movieId) {
  let hoverTimer;

  card.addEventListener("mouseenter", () => {
    // 2초 후 자동으로 모달 열기
    hoverTimer = setTimeout(() => {
      openTrailer(movieId);
    }, 2000);
  });

  card.addEventListener("mouseleave", () => {
    // 호버 취소시 타이머 제거
    clearTimeout(hoverTimer);
  });
}

let render = (movieList) => {
  movieBoard.innerHTML = "";

  movieList.forEach((movie) => {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${
      movie.title
    }" class="movie-poster" />
      
      <h3 class="movie-title">${movie.title}</h3>
      
      <div class="card-overlay">
        <h4 class="overlay-title">📽️ 줄거리</h4>
        <p class="movie-overview">${truncateText(movie.overview, 150)}</p>
        <p class="movie-rating">⭐ ${
          Math.round(movie.vote_average * 10) / 10
        } / 10</p>
        <p class="movie-release">개봉일: ${movie.release_date || "미정"}</p>
      </div>
    `;

    addHoverEvent(card, movie.id);
    movieBoard.appendChild(card);
  });
};

let renderMore = (movieList) => {
  movieList.forEach((movie) => {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${
      movie.title
    }" class="movie-poster" />
      
      <h3 class="movie-title">${movie.title}</h3>
      
      <div class="card-overlay">
        <h4 class="overlay-title">📽️ 줄거리</h4>
        <p class="movie-overview">${truncateText(movie.overview, 150)}</p>
        <p class="movie-rating">⭐ ${
          Math.round(movie.vote_average * 10) / 10
        } / 10</p>
        <p class="movie-release">개봉일: ${movie.release_date || "미정"}</p>
      </div>
    `;

    addHoverEvent(card, movie.id);
    movieBoard.appendChild(card);
  });

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

// 검색 기능
let searchInput = document.querySelector("#searchInput");
let searchBtn = document.querySelector("#searchBtn");

searchBtn.addEventListener("click", async () => {
  let keyword = searchInput.value.trim();

  if (keyword === "") {
    alert("검색어를 입력하세요.");
    return;
  }

  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(
    keyword
  )}&language=ko-KR`;

  try {
    let response = await fetch(url);
    let data = await response.json();
    let movieList = data.results;

    if (movieList.length === 0) {
      movieBoard.innerHTML = '<p class="no-result">검색 결과가 없습니다.</p>';
      moreBtn.style.display = "none";
      return;
    }

    render(movieList);
    moreBtn.style.display = "none";
  } catch (error) {
    console.log("에러 발생:", error);
    alert("검색 중 오류가 발생했습니다.");
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
