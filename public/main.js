let vegan_enumbers_temp = []
let all_enumbers_temp = []
let description_temp = {}
let ongoing = null

async function getVeganEnumbers() {
  if (vegan_enumbers_temp.length == 0) {
    if (ongoing) {
      await ongoing
    } else {
      const req = await fetch("api/enumbers");
      const html_content = await req.json()
      vegan_enumbers_temp = html_content.vegan
      all_enumbers_temp = html_content.all
    }
    return vegan_enumbers_temp
  } else {
    return vegan_enumbers_temp
  }
}

async function getAllEnumbers() {
  if (all_enumbers_temp.length == 0) {
    await getVeganEnumbers()
    return all_enumbers_temp
  } else {
    return all_enumbers_temp
  }
}

async function getEnumberDescription(enumber) {
  if (description_temp['data']) {
    return description_temp['data'].find(x => x.enumber.toLowerCase() === enumber.toLowerCase())
  } else {
    const req = await fetch("api/descriptions");
    const content = await req.json()
    description_temp = content
    return description_temp['data'].find(x => x.enumber.toLowerCase() === enumber.toLowerCase())
  }
}

(async () => {
  const all_enumbers = await getAllEnumbers()
  $(function () {
    $("#input").autocomplete({
      source: all_enumbers.map(x => {
        return {
          label: `${x.enumber} - ${x.name}`,
          value: x.enumber
        }
      }),
      minLength: 2,
      delay: 0,
      // Automatically hide when a full match is found
      response: function (event, ui) {
        if (event.target.value.toLowerCase() == ui.content?.[0]?.value.toLowerCase()) {
          $(this).autocomplete("close");
          checkEnumber()
        }
      },
      select: function (event, ui) {
        checkEnumber(ui.item.value)
      }
    });
  });
})();

async function checkEnumber(override = null) {
  const to_check = (override ?? $("#input").val()).toLowerCase()
  console.log("Getting enumber:", to_check)
  $("#hint").html(`We are checking: ${to_check}`);
  $("#hint").css("color", "black");
  $("#desc").html("")
  $("#desc2").html("")


  const vegan_enumbers = await getVeganEnumbers()
  const all_enumbers = await getAllEnumbers()
  const found = vegan_enumbers.find(x => x.enumber.toLowerCase() === to_check)
  const found_all = all_enumbers.find(x => x.enumber.toLowerCase() === to_check)

  if (found) {
    $("#hint").html(`Ja, <a href='https://en.wikipedia.org/wiki/${found.enumber}'>${found.enumber}</a> is ${found.vegan.toLowerCase()}! ${found.group}`);
    $("#hint").css("color", found.vegan === "Vegan" ? "green" : "orange");
  } else {
    $("#hint").html(found_all ? `Nee, ${found_all.enumber} is niet vegan!` : `Nee, ${to_check} is geen enummmer!`);
    $("#hint").css("color", "red");
  }

  if (found_all) {
    $("#desc").html(`${found_all.enumber} - ${found_all.name} -  <a href='https://en.wikipedia.org/wiki/${found_all.enumber}'>Wikipedia</a>`)

    fetch("https://api.voedingscentrum.nl/api/enumbertool/enumbers/" + found_all.id)
      .then(response => response.json())
      .then(data => {
        $("#desc2").html(data.Text)
      })
  } else {

    $("#desc").html(`Deze info is niet beschikbaar op voedingscentrum`)
  }
}