// https://bootstrap-vue.org/docs#using-module-bundlers ----
import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

// other ----
import goalseek from 'goal-seek';

import './style.scss';

// using https://pages.collegeboard.org/how-to-convert-gpa-4.0-scale
let lookup_percent_to_letter_items = [
  // floor, letter
  { 'floor': 93,  'letter': 'A'  },
  { 'floor': 90,  'letter': 'A-' },
  { 'floor': 87,  'letter': 'B+' },
  { 'floor': 83,  'letter': 'B'  },
  { 'floor': 80,  'letter': 'B-' },
  { 'floor': 77,  'letter': 'C+' },
  { 'floor': 73,  'letter': 'C'  },
  { 'floor': 70,  'letter': 'C-' },
  { 'floor': 67,  'letter': 'D+' },
  { 'floor': 65,  'letter': 'D'  },
  { 'floor': 0,   'letter': 'F'  }
]

let lookup_letter_to_number_items = [
  // letter, number
  { 'letter': 'A',  'number': 4.0 },
  { 'letter': 'A-', 'number': 3.7 },
  { 'letter': 'B+', 'number': 3.3 },
  { 'letter': 'B',  'number': 3.0 },
  { 'letter': 'B-', 'number': 2.7 },
  { 'letter': 'C+', 'number': 2.3 },
  { 'letter': 'C',  'number': 2.0 },
  { 'letter': 'C-', 'number': 1.7 },
  { 'letter': 'D+', 'number': 1.3 },
  { 'letter': 'D',  'number': 1.0 },
  { 'letter': 'F',  'number':   0 }
]

var app = new Vue({
  el: '#app',
  data: {
    lookup_letter_to_number_items:   lookup_letter_to_number_items,
    lookup_percent_to_letter_items:  lookup_percent_to_letter_items,
    grades_input_raw: '',
    show_tables: false,
    curve: 0,
  },
  computed: {
    grades_map_fields: function(){
      let _fields = ['grade_percent', 'grade_letter', 'letter_points']
      if (this.curve){
        _fields = _fields.concat(['curve', 'curved_grade_percent', 'curved_letter_points'])
      }
      return _fields
    },
    grades_input: function() {
      if (this.grades_input_raw === "") {
        return null
      }
      let _parsed_input = this.grades_input_raw.split('\n').filter(element => element.length).map(Number)
      if (!_parsed_input.length){
        return null
      }
      return _parsed_input
    },
    grades_map: function() {
      let _grades_map = this.grades_input.map((grade_percent, index) => {
        let curved_grade_percent = grade_percent + this.curve
        let _obj = {
          'index': index,
          'grade_percent': grade_percent,
          'curve': this.curve,
          'curved_grade_percent': curved_grade_percent
        }
        let table_entry_index = lookup_percent_to_letter_items.findIndex(
          (table_entry) => {
            return grade_percent >= table_entry['floor']
          }
        )
        let grade_letter = lookup_percent_to_letter_items[table_entry_index]['letter']
        _obj['grade_letter'] = grade_letter

        _obj['letter_points'] = lookup_letter_to_number_items.find(element => element['letter'] == grade_letter)['number']

        // curved
        let curved_table_entry_index = lookup_percent_to_letter_items.findIndex(
          (table_entry) => {
            return curved_grade_percent >= table_entry['floor']
          }
        )
        let curved_grade_letter = lookup_percent_to_letter_items[curved_table_entry_index]['letter']
        _obj['curved_grade_letter'] = curved_grade_letter

        _obj['curved_letter_points'] = lookup_letter_to_number_items.find(element => element['letter'] == curved_grade_letter)['number']

        return _obj
      })
      return _grades_map;
    },
    letter_point_average: function() {
      let reducer = (accumulator, current_value) => accumulator + current_value['letter_points']
      let sum = this.grades_map.reduce(reducer, 0)
      let average = sum / this.grades_map.length;
      return average
    },
    curved_letter_point_average: function() {
      let reducer = (accumulator, current_value) => accumulator + current_value['curved_letter_points']
      let sum = this.grades_map.reduce(reducer, 0)
      let average = sum / this.grades_map.length;
      return average
    },
    grades_curved_raw_percent: function() {
      return this.grades_map.map(el => el['curved_grade_percent']).map(String).join("\n")
    },
    grades_curved_raw_letters: function() {
      return this.grades_map.map(el => el['curved_grade_letter']).join("\n")
    }
  }
});