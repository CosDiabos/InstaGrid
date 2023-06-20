var SSM = false;
var bindExit = false;
var slider = "";

$(document).ready(function() {
	//Sortable grid
	$( ".feed ul" ).sortable();
	$( ".feed ul" ).disableSelection();
			
	$('button[name="getProfData"]').click(function() {
		$.post({
			url: "ajax.php",
			data: "action=getData&handler=" + $('input[name="username"]').val(),
			context: document.body
		}).done(function(data) {

			// data = JSON.parse(data);
			$('body').append(data);
			data = JSON.parse();
			$( '.profile-pic img').attr("src", data.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd);

			$( '.username').html("@" + data.entry_data.ProfilePage[0].graphql.user.username);

			$( '.posts').html(data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count + " posts");

			$( '.followers').html(data.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count + " followers");

			$( '.follows').html(data.entry_data.ProfilePage[0].graphql.user.edge_follow.count + " following");

			$( '.desc').html(data.entry_data.ProfilePage[0].graphql.user.full_name + " " +data.entry_data.ProfilePage[0].graphql.user.biography);
		});
	});

	$("input:file").change(function (){
		$('form[name="imgsFeed"]').trigger('submit');
	});

	$('form[name="imgsFeed"]').submit(function(e) {
		e.preventDefault();
		$.ajax({
			url: "ajax.php",
			type: "POST",
			contentType: false,
			cache: false,
			processData:false, 
			data: new FormData($('form[name="imgsFeed"]')[0]),
			context: document.body
		}).done(function(data) {
			result = JSON.parse(data);
			$('.feed .helper .result').slideUp().html('');
			i = 0;
			result.forEach(function(elem) {
				if (elem.uploaded == true) {
					bindExit = true;
					if (elem.i == "-1") {
						// new item
						$('.zero_grid').slideUp();
						$('.feed ul').prepend('<li data-i="' + i + '" data-img="' + elem.file + '"><img src="' + window.location.protocol +  '//' + info.url + '/' + elem.file + '"/></li>');
						$('.feed ul li[data-i="' + i + '"]').css('height', $('.feed ul li[data-i="' + i + '"]').css('width'));

					} else {
						// another img on item
						e = $($('.feed ul li').get(elem.i));
						if (e.find('.wrap').length == 0) {
							// convert to gallery
							e.find('img').wrapAll('<div class="wrap"></div>');
							e.attr('data-galery', "1");
							e.find('.wrap').append("<img src='" + window.location.protocol +  "'//" + info.url + "/" + elem.file + "'/>");
							var di = e.attr('data-img');
							e.attr('data-img', di + '#' + elem.file);
							generateNav(e);
						}
						var sliderElem = e.find('.wrap').get(0);
						slider = simpleslider.getSlider({
							container: sliderElem,
							onChangeEnd: updateBullet
						});
						e.css('height', e.css('width'));
					}
					
				} else {
					$('.feed .helper .result').append('No fue posible subir el archivo <b>' + elem.name + '</b>.<br>Razón: ' + elem.error);
				}
			});
			if (bindExit == true) {
				$(window).bind('beforeunload', function(){
				  return 'Are you sure you want to leave?\nYour grid will be lost!';
				});
			}
			if ($('.feed .helper .result').html() != "") {
				$('.feed .helper .result').slideDown();
			}
			$('form[name="imgsFeed"] input[name="i"]').val('');
		});
	});

	$('.export').click(function(e) {
		e.preventDefault();
		$('form[name="exportGrid"] input[name="d"]').val(prepareGrid());
		$('form[name="exportGrid"]').trigger('submit');
	});

	

	$('.feed > ul').on({
		mouseenter: function(e) {
		$(this).append(OverlayAddMore);
	}, mouseleave:function() {
		$(this).find('.addMoreImgs').remove();
	} }, 'li, li .wrap');

	// Add More Click
	$('.feed ul').on({
		click: function(e) {
			e.preventDefault();
			$('form[name="imgsFeed"] input[name="i"]').val($(this).parent().parent().attr('data-i'));
			$("input:file").trigger('click');
		}},'.addMoreImgs a.add');

	// Remove item
	$('.feed ul').on({
		click: function(e) {
			e.preventDefault();
			el = $(this).closest('li');
			// console.log($('.feed ul li').index($(this)));
			// console.log($('.feed ul li .wrap img').index(this));
			// console.log($('.feed ul li .wrap img').index($(this)));
			if (confirm("Are you sure?")) {
				if (el.find('img').length == 1) {
					el.remove();
				} else {

					// z-index:3 always the visible img from gallery
					imgToRemove = el.find('.wrap img:styleEquals("z-index: 3")');
					imgName = imgToRemove.attr('src');
					var di = el.attr('data-img');
					var newD = "";
					var urls = di.split('#');
					for(i=0;i<urls.length;i++) {
						if (urls[i] != imgName) {
							newD = newD + imgName;
						}
						if (i < urls.length-1) {
							newD = newD + "#";
						}
					}
					el.attr('data-img', newD);
					console.log("Img TO remove: " + imgName);
					console.log("new attr: " + newD);
					imgToRemove.remove();
					slider = simpleslider.getSlider({
							container: el.find('.wrap').get(0),
							onChangeEnd: updateBullet
						});
				}
			}
		}
	}, '.addMoreImgs a.del');


	$('.screenshot').click(function(e) {
		e.preventDefault();
		SSM = true;
		$('.helper').slideUp();
		$('.msgbox').slideDown();
		setTimeout(function() { $('.msgbox').fadeOut(); }, 1800);
	});

	$(document).keydown(function(e) {
		if (e.key == "Escape" && SSM == true) {
			$('.helper').slideDown();	
			SSM = false;
		}
	});

	setInterval(
        function ()
        {
        $.ajax({
           url: 'ajax.php',
           data: "action=keepalive",
           cache: false
        });
    },
    600000
	);
// End onLoad
});

var OverlayAddMore = `
<div class="addMoreImgs"><a href="#" class="" onclick="return false;"><i class="fas fa-expand-arrows-alt"></i> Move to rearrange</a><a href="#" class="add"><i class="fas fa-plus"></i> Add images to this post</a><a href="#" class="del"><i class="fas fa-minus"></i> Remove image</a></div>
`;
var BulletSlider = `
<span class="bullet" data-i="%i">&nbsp;</span>
`;

	function prepareGrid() {
		var grid = [];
		var c = 1;
		$($(".feed li").get().reverse()).each(function() {
			var gridElement = {order:c, img:$(this).attr('data-img')};
			grid.push(gridElement);
			c++;
		});
		return JSON.stringify(grid);
	}


function updateBullet() {
	jQuery('.imgbullets .bullet').removeClass('activo');
	jQuery(jQuery('.imgbullets .bullet').get(slider.currentIndex())).addClass('activo');
}

function resumeSlider() {
	slider.resume();
	window.clearTimeout(sliderTS);

}

function generateNav(event) {
	if (event.find('.imgbullets').length == 0) {
		event.append('<div class="imgbullets"></div>');
	} else {
		event.find('.imgbullets').html('');
	}
	for(i=0;i<=event.length;i++) {
		$('.imgbullets').append(BulletSlider.replace('%i',i));
	}
}


jQuery.extend(jQuery.expr[':'], {
    styleEquals: function(a, i, m){
        var styles = $(a).attr("style").split(";")
        var found = false;
        for (var i = 0; i < styles.length; i++) {
                if (styles[i]===m[3]) {
                        found = true;
                        break;
                }
        }
        return found;
    }
});