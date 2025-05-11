import Select from 'react-select';
import qs from 'qs';
import axios from 'axios';

const selectMenuPortalStyles = {
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

<Select
  isMulti
  options={authors.map(a => ({ value: a, label: a }))}
  value={selectedAuthors}
  onChange={setSelectedAuthors}
  placeholder="Select authors..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={genres.map(g => ({ value: g, label: g }))}
  value={selectedGenres}
  onChange={setSelectedGenres}
  placeholder="Select genres..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={languages.map(l => ({ value: l, label: l }))}
  value={selectedLanguages}
  onChange={setSelectedLanguages}
  placeholder="Select languages..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={formats.map(f => ({ value: f, label: f }))}
  value={selectedFormats}
  onChange={setSelectedFormats}
  placeholder="Select formats..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={publishers.map(p => ({ value: p, label: p }))}
  value={selectedPublishers}
  onChange={setSelectedPublishers}
  placeholder="Select publishers..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

const res = await axios.get(`http://localhost:5176/api/books`, {
  headers: { Authorization: `Bearer ${token}` },
  params,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
}); 