'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let myFunc = num => Number(num);

class Workout {
  constructor(type,coords, duration, distance) {
    this.date = new Date();
    this.id = Number((Date.now() + '').slice(-7));
    this.type = type;
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
_setDescription(){
const descr=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()-1]} ${this.date.getDate()}`;
return descr;

}
}
class Running extends Workout {
  constructor(coords, duration, distance, cadence) {
    super('running',coords, duration, distance);
    this.cadence = cadence;
  }
  _calPace() {
    this.pace = this.duration / this.distance;
    return this.pace.toFixed(1);
  }
}
class Cycling extends Workout {
  constructor(coords, duration, distance, elevationGain) {
    super('cycling',coords, duration, distance);
    this.elevationGain = elevationGain;
    }
  _calSpeed() {
    this.speed = this.distance / (this.duration / 60).toFixed(1);
    return this.speed;
  }
}

// ========== App class ===================

class App {
  #pos;
  #map;
  #Workouts = [];
  #mapZoomLevel=13;
  constructor() {
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElev);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    this._currentPos();
  }
  _currentPos() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Location not found');
      }
    );
  }
  _loadMap(position) {
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
  }

  _newWorkout(e) {
    let workOut;
    e.preventDefault();
    const validate = (...inputs) => {
      return inputs.every(inp => Number.isFinite(inp) && inp > 0);
    };
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#pos.latlng;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (!validate(distance, duration, cadence))
        return alert('Inputs must be positive');
      workOut = new Running([lat, lng], duration, distance, cadence);
      this.#Workouts.push(workOut);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (!validate(distance, duration, elevation))
        return alert('Inputs must be positive');
      workOut = new Cycling([lat, lng], duration, distance, elevation);
      this.#Workouts.push(workOut);
    }
    this._marker(workOut);
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _marker(workOut) {
    L.marker(workOut.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 200,
          autoClose: false,
          closeOnClick: false,
          className: `${workOut.type}-popup`,
        })
        )
        .openPopup();
        this._renderWorkout(workOut);
  }

  _showForm(position) {
    form.classList.remove('hidden');
    this.#pos = position;
  }

  _toggleElev(e) {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // Render workout with details of workout type

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout._setDescription()}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type==='running'?'🏃‍♂️':'🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
            </div> `;
            if (workout.type==='running'){
              html+=`<div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout._calPace()}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
          </li>`
            }
           else if (workout.type==='cycling')
           {
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout._calSpeed()}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`
           }
           form.insertAdjacentHTML('afterend',html);
          form.classList.add('hidden');
           }

          
           _moveToPopup(e) {
            if (!this.#map) return;
        
            const workoutEl = e.target.closest('.workout');
        
            if (!workoutEl) return;
        
            const workout = this.#Workouts.find(
              work => work.id == workoutEl.dataset.id
            );
        console.log(workout);
            this.#map.setView(workout.coords, this.#mapZoomLevel, {
              animate: true,
              pan: {
                duration: 1,
              },
            });
             }

    }
  
const p1 = new App();
