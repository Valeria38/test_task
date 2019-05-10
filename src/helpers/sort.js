const sort = (items, title) => {
  switch(title) {
    case 'cities': return Object.keys(items).sort((a, b) => items[b] - items[a]);
    break;
    case 'countries': return Object.keys(items).sort((a, b) => items[b].length - items[a].length);
    break;
    case 'companies': return items.sort((a, b) => items[a] - items[b]);
    break;
    default: items.sort((a, b) => items[a] - items[b]);
    break;
  }
};

export default sort;