var orig_unused = [];

$(document).ready (function () {
    $("#orig_text").val("");
    $("#anag").val("");
    
    $("#orig_text").keyup(function() {
        $("#orig").html($("#orig_text").val());
    });
   
    $("#anag").keydown(function(event) {
        var k = event.which;
        
        if (k==0) {
            event.preventDefault();
            return;
        }
        
        var kasc = "";
        switch(k) {
            case 160: kasc = "ì"; break;
        }
        
        if (kasc == "") {
            kasc = String.fromCharCode(k);
        }
        
        kasc = replaceChar(kasc).toLowerCase();
        
        if (! kasc.match(/\W/g) && $.inArray(kasc, orig_unused) == -1)
        {
            event.preventDefault();
        }
    });
    
    $("#orig_text, #anag").keyup(function() {
    
        checkStrings($("#separa_vocali").is(":checked"));
        
        var totale = $("#orig_text").val().replace(/[^a-zA-Zàèéìòù]/g,"").length;
        
        if (totale > 0) {
            var utilizzate = $("#anag").val().replace(/[^a-zA-Zàèéìòù]/g,"").length;
            
            $("#utilizzate").html(utilizzate);
            $("#totale").html(totale);
            $(".opzioni, #shuffle_anag").css("visibility", "visible");
            
            var lettere_errate_anagramma = lettereErrateAnagramma();
            if (lettere_errate_anagramma > 0)  {
                $("#anag").addClass("anag_warning");
                var wrn = "L'anagramma contiene " + lettere_errate_anagramma 
                    + (lettere_errate_anagramma==1 ? " lettera non presente " : " lettere non presenti ")
                    + "nella frase originale!"
                $("#warning").show().html(wrn);
                $("#conteggio").hide();
            }
            else {
                $("#anag").removeClass("anag_warning");
                $("#conteggio").show();
                $("#warning").hide();
            }
        }
        else {
            $(".opzioni, #shuffle_anag").css("visibility", "hidden");
        }
    });
    
    $("#shuffle_anag").click(function(){
        var string = $("#orig").text().toLowerCase().replace(/[^a-zA-Zàèéìòù]/g,"");
        if (string == "") {
            return;
        }
        
        var parts = string.split('');
        for (var i = parts.length; i > 0;) {
            var random = parseInt(Math.random() * i);
            var temp = parts[--i];
            parts[i] = parts[random];
            parts[random] = temp;
        }
        
        $("#anag").val(parts.join(''));
    });
    
    $("#separa_vocali").change(function(){
        checkStrings($(this).is(":checked"));
    });
    
    $("#evidenzia_utilizzate, #nascondi_utilizzate").change(function(){
        if ($("#evidenzia_utilizzate").is(":checked")) {
            $(".in_anag").removeClass("in_anag_hidden").addClass("in_anag_color");
        }
        else {
            $(".in_anag").addClass("in_anag_hidden").removeClass("in_anag_color");
        }
        
    });
});


function checkStrings(separa) {
    var text = $("#orig_text").val().toLowerCase().replace(/[^a-zA-Z\sàèéìòù]/g,"");
    var anag = $("#anag").val().toLowerCase().replace(/[^a-zA-Z\sàèéìòù]/g,"");
    var anag_proc = "";
    var new_text = text;
    var new_text_arr = [];
    
    for (i=0; i<anag.length; i++) {
        anag_proc += replaceChar(anag[i]);
    }
    var vocali="", consonanti="", vocali_in_anag="", consonanti_in_anag="";
    
    var j=0;
    orig_unused = [];
    for (var i=0; i<text.length; i++) {
        var t = replaceChar(text[i]);
        var re = new RegExp(t, '');
        
        var in_anag = anag_proc.match(re);
        
        if(in_anag){
            new_text_arr[i] = '<span class="in_anag">'+t+'</span>';
            anag_proc = anag_proc.replace(re, '');
            in_anag = true;
        }
        else {
            new_text_arr[i] = t;
            orig_unused[j] = t;
            j++;
        }
        
        if(separa) {
            if (t.match(/[aeiou]/g)) {
                vocali += t;
                if (in_anag) {
                    vocali_in_anag += t;
                }
            } else if (t.match(/[a-zA-Z]/g)) { // solo le consonanti...
                consonanti += t;
                if (in_anag) {
                    consonanti_in_anag += t;
                }
            }
        }
    }
    
    if (new_text_arr.length > 0) {
        new_text = new_text_arr.join('');
    }
    
    if(separa) {
        
        var vocali_sorted = sortString(vocali);
        var consonanti_sorted = sortString(consonanti);
        
        var vocali_sorted_with_tags=[], consonanti_sorted_with_tags=[];
        
        for (var i=0; i<vocali_sorted.length; i++) {
            var re = new RegExp(vocali_sorted[i], '');
            
            if(vocali_in_anag.match(re)) {
                vocali_sorted_with_tags[i] = '<span class="in_anag">'+vocali_sorted[i]+'</span>';
                
                vocali_in_anag = vocali_in_anag.replace(re, "");
            }
            else {
                vocali_sorted_with_tags[i] = vocali_sorted[i];
            }
        }
        
        vocali_sorted = vocali_sorted_with_tags.join(' ');
        
        for (var i=0; i<consonanti_sorted.length; i++) {
            var re = new RegExp(consonanti_sorted[i], '');
            
            if(consonanti_in_anag.match(re)) {
                consonanti_sorted_with_tags[i] = '<span class="in_anag">'+consonanti_sorted[i]+'</span>';
                
                consonanti_in_anag = consonanti_in_anag.replace(re, "");
            }
            else {
                consonanti_sorted_with_tags[i] = consonanti_sorted[i];
            }
        }
        
        consonanti_sorted = consonanti_sorted_with_tags.join(' ');
        
        $("#orig").html(consonanti_sorted);
        $("#orig2").html(vocali_sorted).show();
    }
    else {
        $("#orig").html(new_text);
        $("#orig2").html("").hide();
    }
    
    if($("#evidenzia_utilizzate").is(":checked")) {
        $(".in_anag").addClass("in_anag_color");
    }
    else {
        $(".in_anag").addClass("in_anag_hidden");
    }
}


function replaceChar(t) {
    var toreplace = {
        'à' : 'a', 'è' : 'e', 'é' : 'e', 'ì' :'i', 'ò' : 'o', 'ù' : 'u'
    };
    
    if(toreplace[t] !== undefined) {
        return toreplace[t];
    }
    else {
        return t;
    }
}

function lettereErrateAnagramma() {
    var num_lettere_errate = 0;
    
    var text = $("#orig_text").val().toLowerCase().replace(/[^a-zA-Zàèéìòù]/g,"");
    var anag = $("#anag").val().toLowerCase().replace(/[^a-zA-Zàèéìòù]/g,"");
    var text_proc = "";
    
    var i;
    for (i=0; i<text.length; i++) {
        text_proc += replaceChar(text[i]);
    }
    
    for (i=0; i<anag.length; i++) {
        var a = replaceChar(anag[i]);
        var re = new RegExp(a, '');
        
        if(text_proc.match(re)){
            text_proc = text_proc.replace(re, '');
        }
        else {
            num_lettere_errate++;
        }
    }
    
    return num_lettere_errate;
}

function sortString(str) {
    str = str.toLowerCase().replace(/[^a-zA-Zàèéìòù]/g,"");
    str = str.split('');  
    return str.sort(function (a,b) {
        if (a === '0' || b === '0')
            return (b === a) ?  0 : (a < b) ? 1 : -1;

        return (a < b) ? -1 : (a === b) ? 0 : 1;
    }).join('');  
}
