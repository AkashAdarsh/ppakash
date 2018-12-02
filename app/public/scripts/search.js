$('#party-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/party?' + search, function(data) {
    $('#party-grid').html('');
    data.forEach(function(party) {
      $('#party-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ party.image }">
            <div class="caption">
              <h4>${ party.name }</h4>
            </div>
            <p>
              <a href="/party/${ party._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#party-search').submit(function(event) {
  event.preventDefault();
});
