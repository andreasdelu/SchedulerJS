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
	constructor(element = "", events = [], timeFormat = 24) {
		this.element = document.querySelector(element);
		this.events = events;
		this.timeFormat = timeFormat;
		this.scheduleId = crypto.randomUUID();
		this.hoveredTime = "00:00";
		this.eventGrabbed = {
			grabbed: false,
			resizing: false,
			id: "",
			prevPos: "",
		};
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

		this.addListeners();
		this.loadEvents(this.events);
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
		hoverTime.innerText = "21:00";

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

		contentContainer.appendChild(this.createCurrentTimeIndicator());

		bodyContainer.appendChild(contentContainer);

		bodyContainer.addEventListener("mousemove", (e) =>
			this.handleMouseMove(e, this.scheduleId, this)
		);
		bodyContainer.addEventListener("mouseout", (e) =>
			this.handleMouseOut(e, this.scheduleId)
		);

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
		if (target.classList.contains("schedulerRow")) {
			hoverTime.style.opacity = 1;
			let mousePos = e.clientY + body.scrollTop - body.offsetTop - 25;
			let rowPos = mousePos - target.offsetTop + 25;

			if (rowPos <= 15) {
				hoverTime.style.transform = `translateY(${target.offsetTop}px)`;
				hoverTime.innerText = target.dataset.time + ":00";
				self.hoveredTime = {
					time: target.dataset.time + ":00",
					day: target.dataset.day,
				};
			} else if (rowPos <= 30 && rowPos > 15) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 15}px)`;
				hoverTime.innerText = target.dataset.time + ":15";
				self.hoveredTime = {
					time: target.dataset.time + ":15",
					day: target.dataset.day,
				};
			} else if (rowPos <= 45 && rowPos > 30) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 30}px)`;
				hoverTime.innerText = target.dataset.time + ":30";
				self.hoveredTime = {
					time: target.dataset.time + ":30",
					day: target.dataset.day,
				};
			} else if (rowPos <= 60 && rowPos > 45) {
				hoverTime.style.transform = `translateY(${target.offsetTop + 45}px)`;
				hoverTime.innerText = target.dataset.time + ":45";
				self.hoveredTime = {
					time: target.dataset.time + ":45",
					day: target.dataset.day,
				};
			}
		} else {
			hoverTime.style.opacity = 0;
		}
	}
	handleMouseOut(e, id) {
		let hoverTime = document.getElementById(`schedulerHoverTime-${id}`);
		hoverTime.style.opacity = 0;
	}

	addListeners() {}

	loadEvents(eventArray) {
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

				let eventTitle = document.createElement("p");
				eventTitle.classList.add("schedulerEventTitle");
				eventTitle.classList.add("schedulerEventTitle-" + this.scheduleId);
				eventTitle.innerText = event.title;

				let eventTime = document.createElement("p");
				eventTime.classList.add("schedulerEventTime");
				eventTime.classList.add("schedulerEventTime-" + this.scheduleId);
				eventTime.innerText = event.timeStart + " - " + event.timeEnd;

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

				eventCard.appendChild(eventGrabber);
				eventCard.appendChild(eventResize);
				eventCard.appendChild(eventTitle);
				eventCard.appendChild(eventTime);

				row.appendChild(eventCard);
			}
		});

		this.addGrabListeners();
	}

	addGrabListeners() {
		let allRows = document.querySelectorAll(".schedulerRow-" + this.scheduleId);

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
				if (newTime <= startTime + 15) {
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
			let eventId = this.eventGrabbed.id;
			const card = document.getElementById("event-" + eventId);
			this.checkOverlap(card);
			const clone = document.getElementById(
				"eventClone-" + this.eventGrabbed.id
			);
			if (clone) {
				clone.remove();
			}
			card.style.zIndex = 3;
			card.style.boxShadow = "";
			card.style.pointerEvents = "all";

			this.updateEventData(eventId);

			this.eventGrabbed = {
				grabbed: false,
				resizing: false,
				id: "",
				prevPos: "",
			};
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
			console.log(this.events);
		}
	}

	resetEventPos() {}

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

	checkOverlap(event) {
		/* Get column events */
		let column = document.querySelector(
			`.schedulerColumn-${this.scheduleId}[data-day="${event.dataset.day}"]`
		);
		console.log(column);
	}
}
