const express=require('express');
const sql=require('mssql');
const bp=require("body-parser");
var session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const app=express();


app.set("view engine","ejs");
app.use(bp.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//DATABASE Bağlantı Noktası
var config={
  user: "admin",
  password: "1111111111",
  server:"YourServerName",
  database:"DatabaseName",
  Port: "xxxx",
  trustServerCertificate: true
};
//  Çerez Oluşturma  ***********
app.use(
  session({
    store: new MSSQLStore(config), // options are optional
    secret: 'supersecret',
    resave: false,
    saveUninitialized:  false,
    cookie: {}
  })
);
//      ************
var conn=new sql.ConnectionPool(config);
var req=new sql.Request(conn);

//  Frontend Alanı***********
app.get("/",function(req,res){
      res.sendFile(__dirname + "/index.html");
});
// app.get("/AdminEkle",function(req,res){
//   res.sendFile(__dirname  + "/admin.html");
// });
app.get("/FirmaKayit",function(req,res){
    res.sendFile(__dirname  + "/kayit.html");
});
app.get("/AdminPanel",function(req,res){
  if(req.session.mod==2){
    (res.render('panel'));
  }
  else{
    res.redirect("/AdminLogin");
  }
})
app.get("/AdminLogin",function(req,res){
  res.sendFile(__dirname  + "/adminlogin.html");
});
app.get("/FirmaLogin",function(req,res){
  if(req.session.mod==1){
    res.redirect("/");
  }
  else{
    res.sendFile(__dirname  + "/FirmaLogin.html");
  }
});
app.get("/logout",function(req,res){
  req.session.destroy();
  res.redirect("FirmaGiris");
})
//*******************************
app.get("/Araclar",function(req,res){
  var araclarArray;
  var requ=new sql.Request(conn)
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
     requ.query("SELECT * FROM Arac", async function(err,result){
      if(err){
        console.log(err);
      }
      else{
        araclarArray=result.recordset;
        start()

        console.log(araclarArray);
      }
      conn.close();
    });
  });
function start(){
  (res.render('araclar',{DataArac:araclarArray}));
}

});

//********Araç Listele*****************
app.get("/Araclar/:arac",function(req,res){
  var aracbilgileri;
  var arac=req.params.arac;
  var requ=new sql.Request(conn)
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
     requ.query("SELECT * FROM Arac WHERE Model='"+arac+"'", async function(err,result){
      if(err){
        console.log(err);
      }
      else{
        aracbilgileri=result.recordset;
        goster()

        console.log(aracbilgileri);
      }
      conn.close();
    });
  });
  function goster(){
    (res.render('arac',{Info:aracbilgileri}));
  }
});
//******************************************
//********Tek Araç Listele*****************
app.get("/Kirala/:Arac",function(req,res){
  if(req.session.mod==1){
    var aracbilgileri;
    var firmabilgileri;
    var arac=req.params.Arac;
    var requ=new sql.Request(conn)
    conn.connect(function(err){
      if(err){
        console.log(err);
        return;
      }
       requ.query("SELECT * FROM Arac WHERE Model='"+arac+"'", async function(err,result){
        if(err){
          console.log(err);
        }
        else{
          aracbilgileri=result.recordset;

        }
        conn.close();
      });
      requ.query("SELECT * FROM Firma WHERE FİRMA_AD='"+req.session.ad+"'", async function(err,result){
       if(err){
         console.log(err);
       }
       else{
         firmabilgileri=result.recordset;
         goster()


       }
       conn.close();
     });
    });
    function goster(){
      (res.render('kirala',{DataArac:aracbilgileri,DataFirma:firmabilgileri}));
    }
  }
  else{
    res.redirect("/FirmaLogin");
  }

});
//****************************************
app.post("/FirmaGiris",function(req,res){
  var id=req.body.id;
  var pass=req.body.pass;
  var requ=new sql.Request(conn)
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
     requ.query("SELECT KULLANICI_AD,KULLANICI_SIFRE,FİRMA_AD,Id FROM Firma", async function(err,result){
      if(err){
        console.log(err);
      }
      else{
        var i=0
        while(i<result.recordset.length){
          dbid = result.recordset[i].KULLANICI_AD.replace(/\s+/g, '');
          dbpass = result.recordset[i].KULLANICI_SIFRE.replace(/\s+/g, '');
          var dbFirmaAd=result.recordset[i].FİRMA_AD.replace(/\s+/g, '');
          var dbFirmaNo=result.recordset[i].Id;
          console.log(dbFirmaNo);
          if(dbid==id && dbpass==pass){
            req.session.mod=1;
            req.session.ad=dbFirmaAd;
            req.session.sayı=dbFirmaNo;
            console.log(dbFirmaNo);
            break;
          }
          else{
            console.log("Bulamadı");
          }
          i++;
        }
        res.redirect("/");
      }
      conn.close();
    });
  });
});

//  Filo Çalışanı ve Admini Giriş Backend***********
app.post("/AdminGiris",function(req,res){
  var id=req.body.id;
  var pass=req.body.pass;
  var requ=new sql.Request(conn)
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
     requ.query("SELECT K_ad,Sifre FROM Calisan", async function(err,result){
      if(err){
        console.log(err);
      }
      else{
        // console.log(typeof result.recordset[0].K_ad);
        // console.log(typeof id);
        var i=0

        while(i<result.recordset.length){
          dbid = result.recordset[i].K_ad.replace(/\s+/g, '');
          dbpass = result.recordset[i].Sifre.replace(/\s+/g, '');
          if(dbid==id && dbpass==pass){
            console.log("Buldu");
            req.session.mod=2;
            req.session.ad='Admin';
            req.session.sayı='999';
            res.redirect("/AdminPanel");
            break;
          }
          else{
            console.log("Bulamadı");
          }
          i++;
        }
      }
      conn.close();
    });
  });
});
//*******************************

//  Filo Çalışanı ve Admini ekleme Backend***********
app.post("/CalisanEkle",function(req,res){

  var id=Number(req.body.id);
  var ad=req.body.ad;
  var soyad=req.body.soyad;
  var departman=req.body.departman;
  var rol=req.body.rol;
  var tel=req.body.tel;
  var conn=new sql.ConnectionPool(config);
  var request=new sql.Request(conn);
  console.log(ad);
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
    request.query("INSERT INTO Calısan (ID, AD,SOYAD,DEPARTMAN,ROL,TELEFON_NO) VALUES ('"+id+"','"+ad+"','"+soyad+"', '"+departman+"','"+rol+"','"+tel+"')", function(err,recordset){
      if(err){
        console.log(err);
      }
      else{
        console.log(recordset);
      }
      conn.close();
    });
  });
});
//*******************************

//  Firma Ekleme Backend***********

app.post("/FirmaEkle",function(req,res){
  console.log(req.body.fad);
  var id=req.body.fad;
  var ad=req.body.yad;
  var soyad=req.body.ysad;
  var departman=req.body.ytel;
  var rol=req.body.kad;
  var tel=req.body.sifre;
  var conn=new sql.ConnectionPool(config);
  var req=new sql.Request(conn);
  console.log(ad);
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
    req.query("INSERT INTO Firma (FİRMA_AD,YETKİLİ_AD,YETKİLİ_SOYAD,YETKİLİ_TEL_NO,KULLANICI_AD,KULLANICI_SIFRE) VALUES ('"+id+"','"+ad+"','"+soyad+"', '"+departman+"','"+rol+"','"+tel+"')",
     function(err,recordset){
      if(err){
        console.log(s);
      }
      else{
        res.redirect("/FirmaLogin");
      }
      conn.close();
    });
  });
});
//*******************************
//*****Kiralama*******************
app.post("/kirala",function(req,res){
  if(req.session.mod==1){
    var d=new Date();
    var date=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    var marka=req.body.Marka;
    var model=req.body.Model;
    var firma=req.body.Firma;
    var say=req.body.Sayı;
    var firmano=req.session.sayı;
    var lastdate=req.body.bday;
    var conn=new sql.ConnectionPool(config);
    var req=new sql.Request(conn);
    conn.connect(function(err){
      if(err){
        console.log(err);
        return;
      }
       req.query("INSERT INTO Siparis (Model,Marka,Adet,Firma_No,Bas_Tarih,Bit_Tarih) VALUES ('"+model+"','"+marka+"','"+say+"','"+firmano+"', '"+date+"','"+lastdate+"')",
       function(err,recordset){
        if(err){
          console.log(err);
        }
        else{
          updateat(model,say);
          res.redirect("/");
        }
        conn.close();
      });

    });
  }
  else{
    res.redirect("/FirmaLogin");
  }

});
//*******************************
//*****Liste Alanı****************

app.post("/Listele",function(req,res){
  var url=req.body.secilenad;
res.redirect("/Goster/"+url);
});

app.get("/Goster/:Tablo/Sil/:id",function(req,res){
  var tabload=req.params.Tablo;
  var id=req.params.id;
  var requ=new sql.Request(conn)
  delnames(tabload,id).then(result =>{
    var data=result;
    new sql.ConnectionPool(config).connect().then(pool =>{
      return pool.query(data)
    }).then(result =>{
      res.redirect("/Goster/"+tabload);
    }).then(rr =>{
      sql.close();
    });
  });

});
app.get("/Goster/:Tablo",function(req,res){
var columnadları;
var rowadları;
var tabload=req.params.Tablo;
new sql.ConnectionPool(config).connect().then(pool => {
    return pool.query`Select COLUMN_NAME From INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME= ${tabload}`
}).then(result => {
    columnadları=result.recordset;
}).catch(err => {
    console.log(err);
}).then(rr1 =>{
  names(tabload).then(result=>{
    var data=result;
    new sql.ConnectionPool(config).connect().then(pool =>{
      return pool.query(data)
    }).then(result =>{
      rowadları=result.recordset;
      return rowadları
    }).then(result =>{
      // console.log(result[0].charAt(1))
      console.log(Object.keys(result[0]));
      // for(const[key,value] of Object.entries(result[0])){
      //   console.log(value);
      // }
      // console.log(Object.entries(result[0])[0])[1];
        res.render('goster',{Tablo:result,Columns:columnadları});
    })
  })
}).then(rr2 =>{
  sql.close();
});
});

app.get("/StokEkle",function(req,res){
  var liste;
  new sql.ConnectionPool(config).connect().then(pool => {
      return pool.query`Select Model From Arac`
  }).then(result => {
      liste=result.recordset;
  }).catch(err => {
      console.log(err);
  }).then(result =>{
    res.render('stokEkle',{AraclarListe:liste});
  });
});
app.post("/StokEklePost",function(req,res){
  var arac=req.body.arac;
  var adet=req.body.adet;
  stokekle(arac,adet);
  res.redirect("/AdminPanel");
});
app.get("/AracEkle",function(req,res){
  res.render('aracEkle');
});
app.post("/AracEklePost",function(req,res){
var marka=req.body.marka;
var model=req.body.model;
var fiyat=req.body.fiyat;
var yakıt=req.body.secilenYakıtTürü;
var vites=req.body.secilenVitesTürü;
var ortyakıt=req.body.ortYakıt;
var kapasite=req.body.kapasite;
var hacim=req.body.bagajHacmi;
var adet=req.body.adet;
var kategori=req.body.secilenKategoriTürü;
const form = new formidable.IncomingForm();
var conn=new sql.ConnectionPool(config);
var req=new sql.Request(conn);
conn.connect(function(err){
  if(err){
    console.log(err);
    return;
  }
   req.query("INSERT INTO Arac (Marka,Model,Fiyat,Yakıt_Türü,Vites_Türü,Ort_Yakıt_Tüketimi,Kapasite,Bagaj_Litre,Kalan_Adet,Kategori_Id) VALUES ('"+marka+"','"+model+"','"+fiyat+"','"+yakıt+"', '"+vites+"','"+ortyakıt+"','"+kapasite+"','"+hacim+"','"+adet+"','"+kategori+"')",
   function(err,recordset){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/AdminPanel");
    }
    conn.close();
  });

});

});

//*******************************


function stokekle(model,say){
  var conn=new sql.ConnectionPool(config);
  var req=new sql.Request(conn);
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
    req.query("UPDATE Arac SET Kalan_Adet=Kalan_Adet +'"+say+"' WHERE Model='"+model+"'",
     function(err,recordset){
      if(err){
        console.log(err);
      }

      conn.close();
    });
  });
};

function updateat(model,say){
  var conn=new sql.ConnectionPool(config);
  var req=new sql.Request(conn);
  conn.connect(function(err){
    if(err){
      console.log(err);
      return;
    }
    req.query("UPDATE Arac SET Kalan_Adet=Kalan_Adet -'"+say+"' WHERE Model='"+model+"'",
     function(err,recordset){
      if(err){
        console.log(err);
      }

      conn.close();
    });
  });
}

async function names(tabload){
  var sonuc;
  switch(tabload){
    case "Arac":
      sonuc="SELECT * FROM Arac"
      return sonuc;
      break;
      case "Calisan":
        sonuc="SELECT * FROM Calisan"
        return sonuc;
        break;
        case "Firma":
          sonuc="SELECT * FROM Firma"
          return sonuc;
          break;
          case "Kategori":
            sonuc="SELECT * FROM Kategori"
            return sonuc;
            break;
            case "sessions":
              sonuc="SELECT * FROM sessions"
              return sonuc;
              break;
              case "Siparis":
                sonuc="SELECT * FROM Siparis"
                return sonuc;
                break;
  }

}
async function delnames(tabload,id){
  var sonuc;
  switch(tabload){
    case "Arac":
      sonuc="DELETE FROM Arac WHERE Id='"+id+"'"
      return sonuc;
      break;
      case "Calisan":
        sonuc="DELETE FROM Calisan WHERE Id='"+id+"'"
        return sonuc;
        break;
        case "Firma":
          sonuc="DELETE FROM Firma WHERE Id='"+id+"'"
          return sonuc;
          break;
          case "Kategori":
            sonuc="DELETE FROM Kategori WHERE Id='"+id+"'"
            return sonuc;
            break;
            case "sessions":
              sonuc="DELETE FROM sessions WHERE Id='"+id+"'"
              return sonuc;
              break;
              case "Siparis":
                sonuc="DELETE FROM Siparis WHERE Id='"+id+"'"
                return sonuc;
                break;
  }

}





app.listen(3000);
