(() => {
    const DATA_URL =
        "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";

    let currentOffset = 0;
    let favoriteProducts = JSON.parse(localStorage.getItem("favoriteProducts")) || [];

    const fetchData = async () => {
        const localData = localStorage.getItem("carouselProducts");
        if (localData) {
            return JSON.parse(localData);
        } else {
            try {
                const response = await fetch(DATA_URL);
                const data = await response.json();
                localStorage.setItem("carouselProducts", JSON.stringify(data));
                return data;
            } catch (error) {
                console.error("Veriler alınırken bir hata oluştu:", error);
                alert("Ürün listesi alınamadı. Lütfen daha sonra tekrar deneyin.");
                return [];
            }
        }
    };

    const createCarousel = (products) => {
        const carouselHTML = `
        <div class="carousel">
          <h2>Şunu da Beğenebilirsiniz</h2>
          <div class="carousel-wrapper">
            <button class="carousel-btn left">&lt;</button>
            <div class="carousel-container">
              ${products
                .map(
                    (product) => `
                <div class="carousel-item" data-id="${product.id}" data-url="${product.url}">
                  <img src="${product.img}" alt="${product.name}" />
                  <p>${product.name}</p>
                  <p>${product.price} TL</p>
                  <button class="favorite-btn ${favoriteProducts.includes(product.id) ? "favorited" : ""
                        }">❤</button>
                </div>
              `
                )
                .join("")}
            </div>
            <button class="carousel-btn right">&gt;</button>
          </div>
        </div>
      `;

        $(".product-detail").append(carouselHTML);


        $(".carousel-btn.left").on("click", () => slideCarousel(-1));
        $(".carousel-btn.right").on("click", () => slideCarousel(1));


        $(".carousel-item").on("click", function (e) {
            const url = $(this).data("url");
            if (url) {
                window.open(url, "_blank");
            }
        });

        $(".favorite-btn").on("click", function (e) {
            e.stopPropagation();
            const itemId = $(this).closest(".carousel-item").data("id");
            toggleFavorite(itemId, $(this));
        });
    };

    const applyStyles = () => {
        const styles = `
            /* Carousel Stilleri */
            .carousel { margin-top: 20px; position: relative; }
            .carousel h2 { font-size: 1.5rem; margin-bottom: 10px; }
            .carousel-wrapper { position: relative; display: flex; align-items: center; overflow: hidden; }
            .carousel-container { display: flex; transition: transform 0.3s ease; }
            .carousel-item { flex: 0 0 calc(100% / 6.5); box-sizing: border-box; text-align: center; padding: 10px; cursor: pointer; }
            .carousel-item img { max-width: 100%; border-radius: 8px; }
            .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: #333; color: #fff; border: none; padding: 10px; cursor: pointer; z-index: 10; }
            .carousel-btn.left { left: 10px; }
            .carousel-btn.right { right: 10px; }
            .favorite-btn { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; }
            .favorite-btn.favorited { color: blue; }
    
            /* Favori Bölümü */
            .favorites { margin-top: 30px; }
            .favorites h2 { font-size: 1.5rem; margin-bottom: 10px; }
            .favorites-container { display: flex; flex-wrap: wrap; gap: 20px; }
            .favorite-item { flex: 0 0 calc(100% / 4); text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
            .favorite-item img { max-width: 100%; border-radius: 8px; }
        `;
        $("<style>").html(styles).appendTo("head");
    };

    const slideCarousel = (direction) => {
        const container = $(".carousel-container");
        const itemWidth = $(".carousel-item").outerWidth(true);
        const visibleItems = getVisibleItemsCount();
        const maxOffset = -itemWidth * (container.children().length - visibleItems);

        currentOffset -= direction * itemWidth;

        if (currentOffset > 0) {
            currentOffset = 0;
        } else if (currentOffset < maxOffset) {
            currentOffset = maxOffset;
        }

        container.css("transform", `translateX(${currentOffset}px)`);
    };

    const toggleFavorite = (id, button) => {
        if (favoriteProducts.includes(id)) {
            favoriteProducts = favoriteProducts.filter((favId) => favId !== id);
            button.removeClass("favorited");
        } else {
            favoriteProducts.push(id);
            button.addClass("favorited");
        }
        localStorage.setItem("favoriteProducts", JSON.stringify(favoriteProducts));
        updateFavoritesSection(JSON.parse(localStorage.getItem("carouselProducts")));
    };

    const init = async () => {
        const products = await fetchData();

        createCarousel(products);
        updateFavoritesSection(products);
        applyStyles();
    };

    const createFavoritesSection = (products) => {
        const favoritesHTML = `
            <div class="favorites">
                <h2>Favori Ürünleriniz</h2>
                <div class="favorites-container">
                    ${products
                .map(
                    (product) => `
                          <div class="favorite-item" data-id="${product.id}" data-url="${product.url}">
                              <img src="${product.img}" alt="${product.name}" />
                              <p>${product.name}</p>
                              <p>${product.price} TL</p>
                          </div>
                      `
                )
                .join("")}
                </div>
            </div>
        `;

        $(".product-detail").append(favoritesHTML);


        $(".favorite-item").on("click", function () {
            const url = $(this).data("url");
            if (url) {
                window.open(url, "_blank");
            }
        });
    };

    const updateFavoritesSection = (allProducts) => {

        const favorites = allProducts.filter((product) =>
            favoriteProducts.includes(product.id)
        );


        if (favorites.length === 0) {
            $(".favorites").remove();
        } else {
            $(".favorites").remove();
            createFavoritesSection(favorites);
        }
    };
    const getVisibleItemsCount = () => {
        const screenWidth = $(window).width();
        if (screenWidth < 768) return 2;
        if (screenWidth < 1024) return 4;
        return 6.5;
    };

    let startX = 0;

    $(document).on("touchstart", ".carousel-container", (e) => {
        startX = e.originalEvent.touches[0].clientX;
    });

    $(document).on("touchend", ".carousel-container", (e) => {
        const endX = e.originalEvent.changedTouches[0].clientX;
        const direction = endX > startX ? -1 : 1;
        slideCarousel(direction);
    });

    init();
})();
