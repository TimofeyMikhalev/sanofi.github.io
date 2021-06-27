(function () {
    const specInitWrapper = function (postPermalink, inCallback, outCallback) {
        const mount = function () {
            inCallback();

            let postContainer = document.querySelector(`[data-id="${postPermalink}"`);
            if (postContainer) {
                postContainer.style.height = '';
                postContainer.style.overflow = "";
            }

            window.addEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
        };

        const waitPostDoscrollThenMount = function () {
            const currentPermalink = location.pathname.split('/')[location.pathname.split('/').length - 1];
            if (currentPermalink === postPermalink) {
                mount();
            } else {
                const pathnameChangedHandler = function (event) {
                    const pathname = event.detail.pathname;
                    const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
                    if (event.detail.isSynthetic && (currentPermalink === postPermalink)) {
                        window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                        mount();
                    } else if (!event.detail.isSynthetic) {
                        window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                    };
                };

                window.addEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
            };
        };

        const pathnameChangedHandler = function (event) {
            const pathname = event.detail.pathname;
            const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
            if (currentPermalink !== postPermalink) {
                /* ушли из поста */
                window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                unmount(event);
            };
        };

        const unmount = function (event) {
            function watchScrollBack(event) {
                if (!event.detail.isSynthetic) {
                    /* ушли из инфинит скролла, можно больше не отслеживать возвращение в пост */
                    window.removeEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
                    return;
                };

                const pathname = event.detail.pathname;
                const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
                if (currentPermalink === postPermalink) {
                    /* возврат в пост – нужно заинитить всё заново */
                    mount();

                    window.removeEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
                };
            };

            if (event.detail.isSynthetic) {
                /* переход на следующий пост в инфинит скролле */
                /* нужно вручную отслеживать доскролл обратно */
                window.addEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
            };


            let postContainer = document.querySelector(`[data-id="${postPermalink}"`);

            if (postContainer) {
                postContainer.style.height = postContainer.offsetHeight + 'px';
                postContainer.style.overflow = "hidden";
            }

            outCallback();
        };

        const pageReadyHandler = function () {
            window.removeEventListener("LOCATION/PAGE_READY", pageReadyHandler);

            const currentPermalink = location.pathname.split('/')[location.pathname.split('/').length - 1];
            if (currentPermalink === postPermalink) {
                mount();
            } else {
                waitPostDoscrollThenMount();
            };
        };

        if (document.readyState === 'loading') {
            /* первый вариант, нативное выполнение js */
            /* навешиваем события */
            window.addEventListener("LOCATION/PAGE_READY", pageReadyHandler);
        } else {
            /* второй вариант, выполнение js через реакт */
            /* можно не ждать события, а сразу стартовать скрипты */
            waitPostDoscrollThenMount();
        };
    };

    const specPermalink = 'sanofi-1232'; //Обязательно не забыть проставить пермалинк, иначе код не заинится в посте
    //пермалинк берется из ссылки к посту, например: https://www.the-village.ru/people/specials/roscosmos-1271?unpublished=true&id=619953 – пермалинк тут "roscosmos-1271"

    const deviceType = {
        isMobile: () => window.innerWidth < 768,
        isTablet: () => (window.innerWidth >= 768) && (window.innerWidth < 1024),
        isDesktop: () => window.innerWidth >= 1024,
        isNotDesktop: () => window.innerWidth < 1024,
    };

    //установка и удаление ивент листнеров
    let configOfEventListeners = (function () {
        let arrOfEventsObj = [];

        return function (destroy, eventObj) {
            if (!destroy) {
                eventObj.target.addEventListener(eventObj.type, eventObj.func);

                arrOfEventsObj.push(eventObj);
            } else if (destroy == "current" && arrOfEventsObj.length != 0) {

                arrOfEventsObj.forEach((eventObjCopy) => {
                    let index = arrOfEventsObj.indexOf(eventObjCopy);

                    if (eventObj.type == eventObjCopy.type && eventObj.target == eventObjCopy.target && eventObj.func == eventObjCopy.func) {
                        eventObjCopy.target.removeEventListener(eventObjCopy.type, eventObjCopy.func);

                        arrOfEventsObj.splice(index, 1);
                    }
                });

            } else {
                arrOfEventsObj.forEach((eventObjCopy) => {
                    eventObjCopy.target.removeEventListener(eventObjCopy.type, eventObjCopy.func);
                });

                arrOfEventsObj = [];
            }
        };
    })();
    //**OVER**

    const initPostJs = function () {
        //Cтандартные настройки спецов
        let appContainer = document.querySelector('[data-id="danone-1247"] [data-ui-id="post"]');
        let scrollPercentage = [25, 50, 75, 100];
        document.body.setAttribute('id', specPermalink);

        appContainer ? configOfEventListeners(false, { target: window, type: "scroll", func: whereSrollNow }) : false;
        //END



        //ТВОЙ КОД JS ТУТ
        //Тебе доступны такие сущности: 
        //deviceType
        //deviceType.isMobile() – определение мобильной версии
        //deviceType.isTablet() – определение планшетной версии
        //deviceType.isDesktop() – определение десктопной версии
        //deviceType.isNotDesktop() – определение не десктопной версии версии

        //gaPushEvent("экшн_события", "категория_события", "описание_события", "не_взаимодействие_со_страницей?")

        //configOfEventListeners – addEventLister / removeEventListener
        //configOfEventListeners(false, {target: таргет_события, type: "вид_события", func: название_функции_хэндлера_события}) – установка ивентлистнера
        //configOfEventListeners("current", {target: таргет_события, type: "вид_события", func: название_функции_хэндлера_события}) – ремуваем прослушивание конкретного событие с элемента
        //configOfEventListeners(true, true) – удаляем все повешанные ивент_листнеры




        let variant = document.querySelectorAll('.list__li');
        let answer = document.querySelectorAll('.inner__ul');

        let countOfAnswer = 0;


        variant.forEach((e) => {
            configOfEventListeners(false, { target: e, type: "click", func: showAnswer })
        });


        function showAnswer(e) {
            let target = e.currentTarget;

            answer[countOfAnswer].classList.add("showAnswer");



            setTimeout(() => {

                answer[countOfAnswer].classList.add("showAnswer_end");
            }, 1000);

            if (target.dataset.correct) {
                target.classList.add("correct");

            } else {
                target.classList.add("incorrect");
            }


        }


        let post__content = document.querySelector('.content');
        let buttonToNextQuestion = document.querySelectorAll('.li__button');
        let testContainer = document.querySelector('.test');



        buttonToNextQuestion.forEach((item) => {
            configOfEventListeners(false, { target: item, type: "click", func: changeQuestion });
        });

        function changeQuestion(e) {
            let target = e.currentTarget;

            variant.forEach((item) => {
                item.classList.remove("correct");
                item.classList.remove("incorrect");
            });

            answer.forEach((item) => {
                item.classList.remove("showAnswer");
                item.classList.remove("showAnswer_end")
            });



            post__content.classList.add("transition");

            setTimeout(() => {

                if (post__content.dataset.question >= buttonToNextQuestion.length - 1) {
                    post__content.dataset.question = 0;
                    countOfAnswer = 0;
                } else {
                    post__content.dataset.question = ++countOfAnswer;
                }

                post__content.classList.remove("transition");
            }, 800);

            zenscroll.toY(getCoords(testContainer).top - 80);
            
        }
        console.log(buttonToNextQuestion);

        function getCoords(elem) {
            let box = elem.getBoundingClientRect();

            return {
                top: box.top + pageYOffset
            };
        }


        var scenes = document.querySelectorAll('.parallax__item');
        scenes.forEach((item) => {
            new Parallax(item);
            deviceType.isMobile();
        });
        var villa = document.querySelectorAll('.parallax__item2');
        villa.forEach((item) => {
            new Parallax(item, {
           
        });
   
    
            deviceType.isMobile();
        });



        AOS.init();


        //END





        //Вспомогательные функции спецов
        function whereSrollNow() { // Пуш события проскролла страницы в ГА
            scrollPercentage.forEach((percent) => {
                let index = scrollPercentage.indexOf(percent);

                if (((pageYOffset + window.innerHeight) > (appContainer.offsetHeight * (percent / 100))) && (!appContainer.classList.contains("'scroll_" + percent + "'"))) {
                    appContainer.classList.add("'scroll_" + percent + "'");

                    gaPushEvent("scroll", "user offscroll " + percent + "%", "Пользователь проскролил " + percent + "% поста", true);


                    if (index == (scrollPercentage.length - 1)) {
                        configOfEventListeners("current", { target: window, type: "scroll", func: whereSrollNow });
                    }
                }
            });
        }


        //Функция отправки событий в GA
        function gaPushEvent(action, category, label, nonInteraction) {
            let event = nonInteraction ? "eventWithNonInteraction" : "event";

            window['dataLayer'] ? window.dataLayer.push({ 'event': event, 'eventCategory': category, 'eventAction': action, 'eventLabel': label }) : console.log(action, category, label, nonInteraction);
        }
        //END
    }


    const destroyEventListeners = function () {
        /* прежде чем удалить id спеца нужно проверить, он ли вообще стоит */
        /* чтобы случайно не затереть id следующего спеца */
        if (document.querySelector("body").id === specPermalink) {
            configOfEventListeners(true, true);

            document.querySelector("body").removeAttribute('id');
        };

        /* чистим всё */
    };

    window.location.host.includes("the-village.ru") ? specInitWrapper(specPermalink, initPostJs, destroyEventListeners) : window.addEventListener("load", initPostJs);
})();