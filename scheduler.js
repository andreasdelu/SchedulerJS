const days = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

class Scheduler {
	constructor(element = "", events = [], timeFormat = 24, playlists = []) {
		this.element = document.querySelector(element);
		this.events = events;
		this.playlists = playlists;
		this.timeFormat = timeFormat;
		this.scheduleId = crypto.randomUUID();
		this.hoveredTime = "00:00";
		this.eventGrabbed = {
			grabbed: false,
			resizing: false,
			id: "",
			prevPos: "",
		};
		this.mousePosition = { x: 0, y: 0 };
		let self = this;

		this.init();
	}

	init() {
		console.log("Initializing Scheduler");
		console.log("Found element: " + this.element.id);
		let container = document.createElement("div");

		container.classList.add("scheduler");
		container.id = this.scheduleId;

		let header = this.createHeader();
		container.appendChild(header);
		let body = this.createBody();
		container.appendChild(body);

		this.element.appendChild(container);

		this.loadEvents(this.events);

		this.addGrabListeners();

		let timeLine = document.getElementById(
			"schedulerCurrentTimeLine-" + this.scheduleId
		);

		setTimeout(() => {
			timeLine.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 200);
	}

	createHeader() {
		let headerContainer = document.createElement("div");
		headerContainer.classList.add("schedulerHeader");
		headerContainer.id = "schedulerHeader-" + this.scheduleId;

		let daysContainer = document.createElement("div");
		daysContainer.classList.add("schedulerDays");
		daysContainer.id = "schedulerDays-" + this.scheduleId;

		let spacer = document.createElement("div");
		spacer.classList.add("schedulerDaySpacer");
		spacer.id = "schedulerDaySpacer-" + this.scheduleId;
		daysContainer.appendChild(spacer);

		for (const day of days) {
			const elem = document.createElement("div");
			elem.classList.add("schedulerDay");
			elem.id = "schedulerDay-" + this.scheduleId;
			elem.innerText = day;
			daysContainer.appendChild(elem);
		}

		headerContainer.appendChild(daysContainer);

		return headerContainer;
	}

	createBody() {
		let bodyContainer = document.createElement("div");
		bodyContainer.classList.add("schedulerBody");
		bodyContainer.id = "schedulerBody-" + this.scheduleId;

		let contentContainer = document.createElement("div");
		contentContainer.classList.add("schedulerContent");
		contentContainer.id = "schedulerContent-" + this.scheduleId;

		let timesContainer = document.createElement("div");
		timesContainer.classList.add("schedulerTimes");
		timesContainer.id = "schedulerTimes-" + this.scheduleId;

		for (let i = 0; i < 25; i++) {
			let time = document.createElement("div");
			time.classList.add("schedulerTimeStamp");
			time.id = "schedulerTimeStamp-" + this.scheduleId;
			time.innerText = i < 10 ? `0${i}:00` : `${i}:00`;
			timesContainer.appendChild(time);
		}

		let hoverTime = document.createElement("div");
		hoverTime.classList.add("schedulerHoverTime");
		hoverTime.id = "schedulerHoverTime-" + this.scheduleId;
		hoverTime.innerText = "00:00";

		timesContainer.appendChild(hoverTime);

		contentContainer.appendChild(timesContainer);

		for (let i = 0; i < 7; i++) {
			let column = document.createElement("div");
			column.classList.add("schedulerColumn");
			column.classList.add("schedulerColumn-" + this.scheduleId);
			column.dataset.day = i;
			var day = i;

			for (let i = 0; i < 25; i++) {
				let row = document.createElement("div");
				if (i === 0) {
					row.classList.add("schedulerRowSpacer");
					row.id = `schedulerRowSpacer-${this.scheduleId}`;
				} else {
					row.classList.add("schedulerRow");
					row.classList.add("schedulerRow-" + this.scheduleId);
					row.dataset.time = i < 11 ? `0${i - 1}` : `${i - 1}`;
					row.dataset.day = day;
					row.id = `schedulerRow-${this.scheduleId}`;
				}

				column.appendChild(row);
			}
			contentContainer.appendChild(column);
		}

		let showHover = document.createElement("div");
		showHover.classList.add(
			`schedulerHover`,
			`schedulerHover-${this.scheduleId}`
		);

		contentContainer.appendChild(this.createCurrentTimeIndicator());

		bodyContainer.appendChild(showHover);
		bodyContainer.appendChild(contentContainer);

		bodyContainer.addEventListener("mousemove", (e) =>
			this.handleMouseMove(e, this.scheduleId, this)
		);
		bodyContainer.addEventListener("mouseout", (e) =>
			this.handleMouseOut(e, this.scheduleId)
		);
		bodyContainer.addEventListener("mousedown", (e) => {
			if (e.button === 2) return;
			if (this.eventGrabbed.grabbed || this.eventGrabbed.resizing) return;
			if (e.target.classList.contains("schedulerModalItem-" + this.scheduleId))
				return;
			let modals = document.querySelectorAll(
				".schedulerModalContainer-" + this.scheduleId
			);
			if (modals.length) {
				modals.forEach((modal) => modal.remove());
			} else {
				if (e.target.classList.contains("schedulerRow-" + this.scheduleId)) {
					this.createAddModal(e);
				} else if (
					e.target.classList.contains("schedulerEvent-" + this.scheduleId)
				) {
					this.createEditModal(e);
				}
			}
		});

		return bodyContainer;
	}

	createCurrentTimeIndicator() {
		let now = new Date();
		let currentTimeLine = document.createElement("div");
		currentTimeLine.classList.add("schedulerCurrentTimeLine");
		currentTimeLine.id = "schedulerCurrentTimeLine-" + this.scheduleId;
		currentTimeLine.dataset.currenttime = `${now
			.getHours()
			.toString()
			.padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

		let totalMinutes = now.getHours() * 60 + now.getMinutes();

		currentTimeLine.style.transform = `translateY(${totalMinutes}px)`;

		setInterval(() => {
			now = new Date();
			currentTimeLine.dataset.currenttime = `${now
				.getHours()
				.toString()
				.padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

			totalMinutes = now.getHours() * 60 + now.getMinutes();

			currentTimeLine.style.transform = `translateY(${totalMinutes}px)`;
		}, 5000);

		return currentTimeLine;
	}

	handleMouseMove(e, id, self) {
		let target = e.target;
		let hoverTime = document.getElementById(`schedulerHoverTime-${id}`);
		let body = document.getElementById(`schedulerBody-${id}`);
		let rect = body.getBoundingClientRect();
		let position = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
		this.mousePosition = position;
		let mousePos = position.y + body.scrollTop;
		let showHover = document.querySelector(
			`.schedulerHover-${self.scheduleId}`
		);
		if (target.classList.contains("schedulerRow")) {
			hoverTime.style.opacity = 1;
			showHover.style.opacity = 1;
			let rowPos = mousePos - target.offsetTop;

			if (rowPos <= 15) {
				hoverTime.style.transform = `translateY(${target.offsetTop}px)`;
				hoverTime.innerText = target.dataset.time + ":00";
				self.hoveredTime = {
					time: target.dataset.time + ":00",
					day: target.dataset.day,
				};
				showHover.style.top = "0px";
				target.appendChild(showHover);
			} else if (rowPos <= 30 && rowPos > 15) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 15}px)`;
				hoverTime.innerText = target.dataset.time + ":15";
				self.hoveredTime = {
					time: target.dataset.time + ":15",
					day: target.dataset.day,
				};
				showHover.style.top = "15px";
				target.appendChild(showHover);
			} else if (rowPos <= 45 && rowPos > 30) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 30}px)`;
				hoverTime.innerText = target.dataset.time + ":30";
				self.hoveredTime = {
					time: target.dataset.time + ":30",
					day: target.dataset.day,
				};
				showHover.style.top = "30px";
				target.appendChild(showHover);
			} else if (rowPos <= 60 && rowPos > 45) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 45}px)`;
				hoverTime.innerText = target.dataset.time + ":45";
				self.hoveredTime = {
					time: target.dataset.time + ":45",
					day: target.dataset.day,
				};
				showHover.style.top = "45px";
				target.appendChild(showHover);
			}
		} else {
			hoverTime.style.opacity = 0;
			showHover.style.opacity = 0;
		}
	}
	handleMouseOut(e, id) {
		let hoverTime = document.getElementById(`schedulerHoverTime-${id}`);
		hoverTime.style.opacity = 0;
	}

	loadEvents(eventArray) {
		let allEvents = document.querySelectorAll(
			".schedulerEvent-" + this.scheduleId
		);
		if (allEvents.length > 0) {
			allEvents.forEach((event) => event.remove());
		}
		let allRows = document.querySelectorAll(".schedulerRow-" + this.scheduleId);

		allRows.forEach((row) => {
			let event = eventArray.find(
				(e) =>
					e.day == row.dataset.day &&
					e.timeStart.split(":")[0] == row.dataset.time
			);
			if (event) {
				let body = document.getElementById(`schedulerBody-${this.scheduleId}`);
				let eventId = crypto.randomUUID();
				event.id = eventId;
				let eventCard = document.createElement("div");
				eventCard.classList.add("schedulerEvent");
				eventCard.classList.add("schedulerEvent-" + this.scheduleId);
				eventCard.id = `event-${eventId}`;
				eventCard.style.top = event.timeStart.split(":")[1] + "px";
				let totalMinutes =
					parseInt(event.timeEnd.split(":")[0]) * 60 +
					parseInt(event.timeEnd.split(":")[1]) -
					(parseInt(event.timeStart.split(":")[0]) * 60 +
						parseInt(event.timeStart.split(":")[1]));
				eventCard.dataset.length = totalMinutes;
				eventCard.style.height = totalMinutes + "px";

				eventCard.dataset.day = event.day;
				eventCard.dataset.timeStart = event.timeStart;
				eventCard.dataset.timeEnd = event.timeEnd;
				eventCard.dataset.title = event.title;
				eventCard.dataset.playlist = event.playlist;

				let eventInfo = document.createElement("div");
				eventInfo.classList.add("schedulerEventInfo");
				eventInfo.classList.add("schedulerEventInfo-" + this.scheduleId);

				let eventPlaylist = document.createElement("p");
				eventPlaylist.classList.add("schedulerEventPlaylist");
				eventPlaylist.classList.add(
					"schedulerEventPlaylist-" + this.scheduleId
				);
				this.playlists.forEach((list) => {
					if (event.playlist === list._id) {
						eventPlaylist.innerText = list.clientTitle;
					}
				});

				let eventTitle = document.createElement("p");
				eventTitle.classList.add("schedulerEventTitle");
				eventTitle.classList.add("schedulerEventTitle-" + this.scheduleId);
				eventTitle.innerText = event.title;

				let eventTime = document.createElement("p");
				eventTime.classList.add("schedulerEventTime");
				eventTime.classList.add("schedulerEventTime-" + this.scheduleId);
				eventTime.innerText = event.timeStart + " - " + event.timeEnd;

				eventInfo.appendChild(eventPlaylist);
				eventInfo.appendChild(eventTitle);
				eventInfo.appendChild(eventTime);

				let grabSVG = `
                <svg id="Lag_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 27.65"><circle cx="5.51" cy="5.51" r="5.51"/><circle cx="25" cy="5.51" r="5.51"/><circle cx="44.49" cy="5.51" r="5.51"/><circle cx="5.51" cy="22.14" r="5.51"/><circle cx="25" cy="22.14" r="5.51"/><circle cx="44.49" cy="22.14" r="5.51"/></svg>
                `;
				let eventGrabber = document.createElement("div");
				eventGrabber.classList.add("schedulerEventGrabber");
				eventGrabber.classList.add("schedulerEventGrabber-" + this.scheduleId);
				eventGrabber.id = `schedulerEventGrabber-${eventId}`;
				eventGrabber.dataset.event = eventId;
				eventGrabber.innerHTML = grabSVG + grabSVG;

				let eventResize = document.createElement("div");
				eventResize.classList.add("schedulerEventResizer");
				eventResize.classList.add("schedulerEventResizer-" + this.scheduleId);
				eventResize.id = `schedulerEventResizer-${eventId}`;
				eventResize.dataset.event = eventId;

				let eventBackground = document.createElement("div");
				eventBackground.classList.add("schedulerEventBackground");
				eventBackground.classList.add(
					"schedulerEventBackground-" + this.scheduleId
				);
				/* eventBackground.style.backgroundImage = `url(${event.playlist.coverArt})`; */

				eventCard.appendChild(eventBackground);

				eventCard.appendChild(eventGrabber);
				eventCard.appendChild(eventResize);
				eventCard.appendChild(eventInfo);

				row.appendChild(eventCard);
			}
		});
	}

	addGrabListeners() {
		let body = document.getElementById(`schedulerBody-${this.scheduleId}`);

		body.addEventListener("mousedown", (e) => {
			if (e.target.classList.contains("schedulerEventGrabber")) {
				let eventId = e.target.dataset.event;
				let eventCard = document.getElementById(
					"event-" + e.target.dataset.event
				);
				eventCard.style.pointerEvents = "none";
				let clone = eventCard.cloneNode(true);
				clone.classList.add("schedulerEventIsGrabbed");
				clone.id = `eventClone-${eventId}`;
				eventCard.insertAdjacentElement("beforebegin", clone);
				this.eventGrabbed = {
					grabbed: true,
					resizing: false,
					id: eventId,
					prevPos: clone,
				};
			}
			if (e.target.classList.contains("schedulerEventResizer")) {
				let eventId = e.target.dataset.event;
				let eventCard = document.getElementById(
					"event-" + e.target.dataset.event
				);
				eventCard.style.pointerEvents = "none";
				this.eventGrabbed = {
					grabbed: false,
					resizing: true,
					id: eventId,
					prevPos: "",
				};
			}
		});
		body.addEventListener("mousemove", (e) => {
			if (this.eventGrabbed.grabbed === true) {
				const card = document.getElementById("event-" + this.eventGrabbed.id);
				card.style.zIndex = 5;
				card.style.boxShadow = "0 0 1rem 0 rgba(42, 36, 36, 0.2)";
				body.appendChild(card);
				let row = document.querySelector(
					`[data-time="${this.hoveredTime.time.split(":")[0]}"][data-day="${
						this.hoveredTime.day
					}"] `
				);
				card.style.width = row.offsetWidth - 9 + "px";
				if (row) {
					card.style.left = "4px";
					card.style.top = `${this.hoveredTime.time.split(":")[1]}px`;
					card.dataset.day = this.hoveredTime.day;
					card.dataset.timeStart = this.hoveredTime.time;
					card.dataset.timeEnd = `${this.addLengthToTime(
						this.hoveredTime.time,
						card.dataset.length
					)}`;

					card.querySelector(".schedulerEventTime").innerText = `${
						this.hoveredTime.time
					} - ${this.addLengthToTime(
						this.hoveredTime.time,
						card.dataset.length
					)}`;

					row.appendChild(card);
				}
			}
			if (this.eventGrabbed.resizing === true) {
				const card = document.getElementById("event-" + this.eventGrabbed.id);
				const newTime =
					parseInt(this.hoveredTime.time.split(":")[0]) * 60 +
					parseInt(this.hoveredTime.time.split(":")[1]);
				const startTime =
					parseInt(card.dataset.timeStart.split(":")[0]) * 60 +
					parseInt(card.dataset.timeStart.split(":")[1]);
				if (newTime <= startTime) {
				} else {
					card.dataset.length = newTime - startTime + 15;
					card.style.height = newTime - startTime + 15 + "px";
					card.dataset.timeEnd = `${this.addLengthToTime(
						card.dataset.timeStart,
						card.dataset.length
					)}`;
					card.querySelector(
						".schedulerEventTime"
					).innerText = `${card.dataset.timeStart} - ${card.dataset.timeEnd}`;
				}
			}
		});
		body.addEventListener("mouseup", (e) => {
			if (this.eventGrabbed.grabbed || this.eventGrabbed.resizing) {
				let eventId = this.eventGrabbed.id;
				const card = document.getElementById("event-" + eventId);
				const clone = document.getElementById(
					"eventClone-" + this.eventGrabbed.id
				);
				if (this.checkGrabOverlap(card)) {
					card.remove();
					clone.id = "event-" + eventId;
					clone.classList.remove("schedulerEventIsGrabbed");
					clone.style.pointerEvents = "all";
				} else {
					if (clone) {
						clone.remove();
					}
					card.style.zIndex = 3;
					card.style.boxShadow = "";
					card.style.pointerEvents = "all";
					card.style.width = "";
					this.updateEventData(eventId);
				}

				this.eventGrabbed = {
					grabbed: false,
					resizing: false,
					id: "",
					prevPos: "",
				};
			}
		});
	}

	updateEventData(id) {
		let event = this.events.find((e) => e.id == id);
		const card = document.getElementById("event-" + id);
		if (event) {
			event.title = card.dataset.title;
			event.day = card.dataset.day;
			event.timeStart = card.dataset.timeStart;
			event.timeEnd = card.dataset.timeEnd;
			event.playlist = card.dataset.playlist;
			console.log(this.events);
		}
	}

	addLengthToTime(timeStart, length) {
		let startMinutes =
			timeStart.split(":")[0] * 60 +
			parseInt(timeStart.split(":")[1]) +
			parseInt(length);
		let newLength = `${Math.floor(startMinutes / 60)
			.toString()
			.padStart(2, "0")}:${(startMinutes % 60).toString().padStart(2, "0")}`;

		return newLength;
	}

	checkGrabOverlap(event) {
		/* Get column events */
		let column = document.querySelector(
			`.schedulerColumn-${this.scheduleId}[data-day="${event.dataset.day}"]`
		);

		let rowsInColumn = column.querySelectorAll(
			`.schedulerRow-${this.scheduleId}`
		);

		let foundEvents = [];
		rowsInColumn.forEach((row) => {
			if (row.hasChildNodes()) {
				let events = row.querySelectorAll(`.schedulerEvent-${this.scheduleId}`);
				foundEvents.push(...events);
			}
		});

		if (foundEvents.length <= 1) {
			return;
		}

		for (const foundEvent of foundEvents) {
			if (foundEvent.id === event.id || foundEvent.id.includes("eventClone"))
				continue;
			let eventStart = this.getMinuteAmount(event.dataset.timeStart);
			let eventEnd = this.getMinuteAmount(event.dataset.timeEnd);
			let foundStart = this.getMinuteAmount(foundEvent.dataset.timeStart);
			let foundEnd = this.getMinuteAmount(foundEvent.dataset.timeEnd);

			if (
				(eventStart >= foundStart && eventStart < foundEnd) ||
				(eventEnd > foundStart && eventEnd <= foundEnd)
			) {
				return true;
			} else {
				return false;
			}
		}
	}
	checkAddOverlap(start, end, day) {
		for (const event of this.events) {
			if (event.day != day) continue;
			let eventStart = this.getMinuteAmount(event.timeStart);
			let eventEnd = this.getMinuteAmount(event.timeEnd);

			if (
				(start >= eventStart && start < eventEnd) ||
				(end > eventStart && end <= eventEnd)
			) {
				return true;
			} else {
				return false;
			}
		}
	}

	createAddModal(e) {
		let body = document.getElementById(`schedulerBody-${this.scheduleId}`);
		let scheduler = document.getElementById(`${this.scheduleId}`);

		let container = document.createElement("div");
		container.classList.add("schedulerModalContainer");
		container.classList.add("schedulerModalContainer-" + this.scheduleId);
		body.appendChild(container);

		let posX = this.mousePosition.x + body.scrollLeft;
		let posY = this.mousePosition.y + body.scrollTop;

		if (scheduler.offsetWidth - this.mousePosition.x < container.offsetWidth) {
			container.style.left =
				posX -
				container.offsetWidth +
				(scheduler.offsetWidth - this.mousePosition.x) -
				10 +
				"px";
		} else {
			container.style.left = posX + "px";
		}

		if (
			scheduler.offsetHeight - this.mousePosition.y <
			container.offsetHeight
		) {
			container.style.top =
				posY -
				container.offsetHeight +
				(scheduler.offsetHeight - this.mousePosition.y) -
				60 +
				"px";
		} else {
			container.style.top = posY + "px";
		}

		let modalTitle = document.createElement("p");
		modalTitle.classList.add("schedulerModalTitle");
		modalTitle.classList.add("schedulerModalTitle-" + this.scheduleId);
		modalTitle.innerText = "Add Schedule";

		container.appendChild(modalTitle);

		const createInputContainer = (text, elem) => {
			let modalInputContainer = document.createElement("div");
			modalInputContainer.classList.add("schedulerModalInputContainer");
			modalInputContainer.classList.add(
				"schedulerModalInputContainer-" + this.scheduleId
			);

			let modalInputLabel = document.createElement("p");
			modalInputLabel.classList.add("schedulerModalInputLabel");
			modalInputLabel.classList.add(
				"schedulerModalInputLabel-" + this.scheduleId
			);
			modalInputLabel.innerText = text;

			modalInputContainer.appendChild(modalInputLabel);

			modalInputContainer.appendChild(elem);

			return modalInputContainer;
		};

		let modalInputTitle = document.createElement("input");
		modalInputTitle.classList.add("schedulerModalInputTitle");
		modalInputTitle.classList.add(
			"schedulerModalInputTitle-" + this.scheduleId
		);
		modalInputTitle.type = "text";
		modalInputTitle.name = "modalTitle";
		modalInputTitle.placeholder = "Schedule title...";

		container.appendChild(createInputContainer("Title:", modalInputTitle));

		container.appendChild(
			createInputContainer("Playlist:", this.createPlaylistDropdown())
		);

		let modalInputDay = document.createElement("select");
		modalInputDay.classList.add("schedulerModalInputSelect");
		modalInputDay.classList.add("schedulerModalInputSelect-" + this.scheduleId);
		modalInputDay.name = "modalDay";
		modalInputDay.value = this.hoveredTime.day;

		days.forEach((day, i) => {
			let modalInputOption = document.createElement("option");
			modalInputOption.classList.add("schedulerModalInputOption");
			modalInputOption.classList.add(
				"schedulerModalInputOption-" + this.scheduleId
			);
			modalInputOption.value = i;
			modalInputOption.innerText = day;
			if (i == this.hoveredTime.day) {
				modalInputOption.selected = true;
			}
			modalInputDay.appendChild(modalInputOption);
		});

		container.appendChild(createInputContainer("Day:", modalInputDay));

		let modalInputTimeStart = document.createElement("select");
		modalInputTimeStart.classList.add("schedulerModalInputTime");
		modalInputTimeStart.classList.add(
			"schedulerModalInputTime-" + this.scheduleId
		);

		for (let i = 0; i < 25; i++) {
			let option = document.createElement("option");
			option.classList.add("schedulerModalInputOption");
			option.classList.add("schedulerModalInputOption-" + this.scheduleId);
			option.value = i.toString().padStart(2, "0");
			option.innerText = i.toString().padStart(2, "0");
			if (
				i.toString().padStart(2, "0") == this.hoveredTime.time.split(":")[0]
			) {
				option.selected = true;
			}
			modalInputTimeStart.appendChild(option);
		}

		let modalInputTimeStartMinutes = document.createElement("select");
		modalInputTimeStartMinutes.classList.add("schedulerModalInputTime");
		modalInputTimeStartMinutes.classList.add(
			"schedulerModalInputTime-" + this.scheduleId
		);

		for (let i = 0; i < 4; i++) {
			let minutes = ["00", "15", "30", "45"];
			let option = document.createElement("option");
			option.classList.add("schedulerModalInputOption");
			option.classList.add("schedulerModalInputOption-" + this.scheduleId);
			option.value = minutes[i];
			option.innerText = minutes[i];
			if (minutes[i] == this.hoveredTime.time.split(":")[1]) {
				option.selected = true;
			}
			modalInputTimeStartMinutes.appendChild(option);
		}

		container.appendChild(createInputContainer("Start:", modalInputTimeStart));
		modalInputTimeStart.insertAdjacentElement(
			"afterend",
			modalInputTimeStartMinutes
		);

		let modalInputTimeEnd = document.createElement("select");
		modalInputTimeEnd.classList.add("schedulerModalInputTime");
		modalInputTimeEnd.classList.add(
			"schedulerModalInputTime-" + this.scheduleId
		);

		for (let i = 0; i < 25; i++) {
			let option = document.createElement("option");
			option.classList.add("schedulerModalInputOption");
			option.classList.add("schedulerModalInputOption-" + this.scheduleId);
			option.value = i.toString().padStart(2, "0");
			option.innerText = i.toString().padStart(2, "0");
			if (
				i.toString().padStart(2, "0") ==
				parseInt(this.hoveredTime.time.split(":")[0]) + 1
			) {
				option.selected = true;
			}
			modalInputTimeEnd.appendChild(option);
		}

		let modalInputTimeEndMinutes = document.createElement("select");
		modalInputTimeEndMinutes.classList.add("schedulerModalInputTime");
		modalInputTimeEndMinutes.classList.add(
			"schedulerModalInputTime-" + this.scheduleId
		);

		for (let i = 0; i < 4; i++) {
			let minutes = ["00", "15", "30", "45"];
			let option = document.createElement("option");
			option.classList.add("schedulerModalInputOption");
			option.classList.add("schedulerModalInputOption-" + this.scheduleId);
			option.value = minutes[i];
			option.innerText = minutes[i];
			if (parseInt(this.hoveredTime.time.split(":")[0]) + 1 >= 24) {
				if (i === 0) {
					option.selected = true;
				}
			} else {
				if (minutes[i] == this.hoveredTime.time.split(":")[1]) {
					option.selected = true;
				}
			}
			modalInputTimeEndMinutes.appendChild(option);
		}

		container.appendChild(createInputContainer("End:", modalInputTimeEnd));
		modalInputTimeEnd.insertAdjacentElement(
			"afterend",
			modalInputTimeEndMinutes
		);

		let modalButton = document.createElement("button");
		modalButton.classList.add("schedulerModalButton");
		modalButton.classList.add("schedulerModalButton-" + this.scheduleId);
		modalButton.innerText = "Add";
		modalButton.type = "button";

		container.appendChild(modalButton);

		modalButton.addEventListener("click", (e) => {
			let playlistInfo = document.querySelector(
				".schedulerModalInputPlaylistPicked-" + this.scheduleId
			);
			let eventData = {
				title: modalInputTitle.value,
				day: modalInputDay.value,
				timeStart:
					modalInputTimeStart.value + ":" + modalInputTimeStartMinutes.value,
				timeEnd: modalInputTimeEnd.value + ":" + modalInputTimeEndMinutes.value,
				playlist: playlistInfo.dataset.playlistid,
			};
			this.createNewEvent(eventData);
			container.remove();
		});

		let modalChildren = container.childNodes;
		modalChildren.forEach((child) => {
			child.classList.add("schedulerModalItem-" + this.scheduleId);
			if (child.classList.contains("schedulerModalInputContainer")) {
				let grandchildren = child.childNodes;
				grandchildren.forEach((grandchild) =>
					grandchild.classList.add("schedulerModalItem-" + this.scheduleId)
				);
			}
		});

		container.classList.add("schedulerModalItem-" + this.scheduleId);
	}

	createEditModal(e) {
		let body = document.getElementById(`schedulerBody-${this.scheduleId}`);

		let container = document.createElement("div");
		container.classList.add("schedulerModalContainer");
		container.classList.add("schedulerModalContainer-" + this.scheduleId);
		container.style.top = e.clientY - body.offsetTop + body.scrollTop + "px";
		container.style.left = e.clientX - body.offsetLeft + "px";

		let modalTitle = document.createElement("p");
		modalTitle.classList.add("schedulerModalTitle");
		modalTitle.classList.add("schedulerModalTitle-" + this.scheduleId);
		modalTitle.innerText = e.target.dataset.title;

		container.appendChild(modalTitle);

		body.appendChild(container);
	}

	getMinuteAmount(timeStamp) {
		let hours = parseInt(timeStamp.split(":")[0]) * 60;
		let minutes = parseInt(timeStamp.split(":")[1]);

		return hours + minutes;
	}

	convertToTimeStamp(minuteAmount) {
		let hours = Math.floor(parseInt(minuteAmount) / 60)
			.toString()
			.padStart(2, "0");
		let minutes = (parseInt(minuteAmount) % 60).toString().padStart(2, "0");

		return `${hours}:${minutes}`;
	}

	createNewEvent(eventData) {
		if (!eventData.title) {
			eventData.title = "Schedule";
		}
		let start = this.getMinuteAmount(eventData.timeStart);
		let end = this.getMinuteAmount(eventData.timeEnd);
		if (start >= end) {
			eventData.timeEnd = this.convertToTimeStamp(start + 30);
		}
		if (!eventData.playlist) {
			console.error("No playlist added to schedule!");
			return;
		}
		if (this.checkAddOverlap(start, end, eventData.day)) {
			console.error("Cannot add schedule that overlaps another");
			return;
		} else {
			this.events.push(eventData);
			this.loadEvents(this.events);
		}
	}

	createPlaylistDropdown() {
		let sortedPlaylists = this.playlists.sort((a, b) =>
			a.clientTitle.localeCompare(b.clientTitle)
		);

		let modalInputPlaylistsPicked = document.createElement("div");
		modalInputPlaylistsPicked.classList.add(
			"schedulerModalInputPlaylistPicked"
		);
		modalInputPlaylistsPicked.classList.add(
			"schedulerModalInputPlaylistPicked-" + this.scheduleId
		);

		modalInputPlaylistsPicked.addEventListener("click", (e) => {
			createDropdown();
			getPlaylists("");
		});

		let modalInputPlaylistsPickedTitle = document.createElement("p");
		modalInputPlaylistsPickedTitle.classList.add(
			"schedulerModalInputPlaylistPickedTitle"
		);
		modalInputPlaylistsPickedTitle.classList.add(
			"schedulerModalInputPlaylistPickedTitle-" + this.scheduleId
		);
		modalInputPlaylistsPickedTitle.classList.add(
			"schedulerModalItem-" + this.scheduleId
		);

		modalInputPlaylistsPickedTitle.innerText = "Select playlist";

		let modalInputPlaylistsPickedImage = document.createElement("img");
		modalInputPlaylistsPickedImage.classList.add(
			"schedulerModalInputPlaylistPickedImage"
		);
		modalInputPlaylistsPickedImage.classList.add(
			"schedulerModalInputPlaylistPickedImage-" + this.scheduleId
		);
		modalInputPlaylistsPickedImage.classList.add(
			"schedulerModalItem-" + this.scheduleId
		);

		modalInputPlaylistsPicked.appendChild(modalInputPlaylistsPickedImage);
		modalInputPlaylistsPicked.appendChild(modalInputPlaylistsPickedTitle);

		const createDropdown = (query) => {
			let dropdown = document.createElement("div");
			dropdown.classList.add("schedulerModalItem-" + this.scheduleId);
			dropdown.classList.add("schedulerModalPlaylistDropdown");
			dropdown.classList.add(
				"schedulerModalPlaylistDropdown-" + this.scheduleId
			);
			let dropdownTitle = document.createElement("p");
			dropdownTitle.classList.add("schedulerModalItem-" + this.scheduleId);
			dropdownTitle.classList.add("schedulerModalPlaylistDropdownTitle");
			dropdownTitle.classList.add(
				"schedulerModalPlaylistDropdownTitle-" + this.scheduleId
			);
			dropdownTitle.innerText = "Results:";

			let modalInputPlaylists = document.createElement("input");
			modalInputPlaylists.classList.add(
				"schedulerModalItem-" + this.scheduleId
			);
			modalInputPlaylists.classList.add("schedulerModalInputPlaylistSearch");
			modalInputPlaylists.classList.add(
				"schedulerModalInputPlaylistSearch-" + this.scheduleId
			);
			modalInputPlaylists.name = "modalPlaylists";
			modalInputPlaylists.placeholder = "Search playlists...";

			modalInputPlaylists.oninput = (e) => {
				document.querySelector(
					".schedulerModalPlaylistDropdownLists-" + this.scheduleId
				).innerHTML = "";
				getPlaylists(e.target.value);
			};

			dropdown.appendChild(modalInputPlaylists);
			dropdown.appendChild(dropdownTitle);

			let dropdownLists = document.createElement("div");
			dropdownLists.classList.add("schedulerModalItem-" + this.scheduleId);
			dropdownLists.classList.add("schedulerModalPlaylistDropdownLists");
			dropdownLists.classList.add(
				"schedulerModalPlaylistDropdownLists-" + this.scheduleId
			);

			dropdownLists.addEventListener("click", (e) => {
				if (
					e.target.classList.contains(
						"schedulerModalPlaylistDropdownPlaylist-" + this.scheduleId
					)
				) {
					modalInputPlaylistsPicked.dataset.playlistid = e.target.id;
					modalInputPlaylistsPicked.dataset.name = e.target.dataset.name;
					modalInputPlaylistsPicked.dataset.image = e.target.dataset.img;
					modalInputPlaylistsPickedTitle.innerText = e.target.dataset.name;
					modalInputPlaylistsPickedImage.src = e.target.dataset.img;
					dropdown.remove();
				}
			});

			let closeBtn = document.createElement("div");
			closeBtn.classList.add("schedulerModalItem-" + this.scheduleId);
			closeBtn.classList.add("schedulerModalPlaylistDropdownClose");
			closeBtn.classList.add(
				"schedulerModalPlaylistDropdownClose-" + this.scheduleId
			);
			closeBtn.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
			`;

			closeBtn.onclick = () => {
				dropdown.remove();
			};

			dropdown.appendChild(closeBtn);
			dropdown.appendChild(dropdownLists);

			modalInputPlaylistsPicked.insertAdjacentElement("afterend", dropdown);
		};

		const getPlaylists = (query) => {
			sortedPlaylists.forEach((playlist, i) => {
				if (playlist.clientTitle.toLowerCase().includes(query.toLowerCase())) {
					let list = document.createElement("div");
					list.classList.add("schedulerModalItem-" + this.scheduleId);
					list.classList.add("schedulerModalPlaylistDropdownPlaylist");
					list.classList.add(
						"schedulerModalPlaylistDropdownPlaylist-" + this.scheduleId
					);
					list.dataset.name = playlist.clientTitle;
					list.dataset.img = playlist.coverArt;
					list.id = playlist._id;
					let playlistTitle = document.createElement("p");
					playlistTitle.classList.add("schedulerModalItem-" + this.scheduleId);
					playlistTitle.classList.add(
						"schedulerModalPlaylistDropdownPlaylistTitle"
					);
					playlistTitle.classList.add(
						"schedulerModalPlaylistDropdownPlaylistTitle-" + this.scheduleId
					);
					playlistTitle.innerText = playlist.clientTitle;
					let playlistImage = document.createElement("img");
					playlistImage.classList.add("schedulerModalItem-" + this.scheduleId);
					playlistImage.classList.add(
						"schedulerModalPlaylistDropdownPlaylistImage"
					);
					playlistImage.classList.add(
						"schedulerModalPlaylistDropdownPlaylistImage-" + this.scheduleId
					);
					playlistImage.src = playlist.coverArt;

					list.appendChild(playlistImage);
					list.appendChild(playlistTitle);
					let dropdownLists = document.querySelector(
						".schedulerModalPlaylistDropdownLists-" + this.scheduleId
					);
					dropdownLists.appendChild(list);
				}
			});
		};

		return modalInputPlaylistsPicked;
	}
}
