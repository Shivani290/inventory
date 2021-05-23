const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const MongoClient=require('mongodb').MongoClient;
var db;
var s;
MongoClient.connect('mongodb://localhost:27017/Central', (err,database) =>
{
    if(err) return console.log(err)
    db=database.db('Central')
    app.listen(5000, ()=>{
        console.log('Listening on port 5000')
    })
})
var sessiion=require('express-session');
var flush=require('connect-flash');
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(sessiion({
	secret:'secret',
	cookie:{maxAge:6000},
	resave:false,
	saveUninitialised:false
	
}));
app.use(flush());
app.get('/',(req,res) =>{
    db.collection('Stationary').find().toArray((err,result)=>{
        if(err) return console.log(err)
    res.render('home.ejs', {data:result})
    })     
})


app.get('/create', (req,res)=>{
    res.render('add.ejs',{message:req.flash('message')})
})

app.get('/updateitems', (req,res)=>{
    res.render('update.ejs')
})

app.get('/deleteitems', (req,res)=>{
    res.render('delete.ejs')
})

app.post('/adddata',(req,res)=>{
    db.collection('Stationary').save(req.body,(err,result)=>{
        if(err)
		{	
	return console.log(err)
	req.flash('message','enter valid items');
	res.redirect('/');
		}
    res.redirect('/')
    })
})

app.post('/update',(req,res)=>{
   db.collection('Stationary').find().toArray((err,result)=>{
       if(err)
         return console.log(err)
       for(var i=0;i<result.length;i++)
       {
           if(result[i].pid==req.body.pid)
           {
               s=result[i].stock
               break
           }
       }
       db.collection('Stationary').findOneAndUpdate({pid: req.body.pid},{
        $set:{stock:parseInt(s)+parseInt(req.body.stock)}}, {sort:{_id:-1}},
        (err,result)=>{
            if(err)
                return res.send(err)
            console.log(req.body.id+'stock is updated')
            res.redirect('/')
        })
       //)
   })
})

app.post('/delete',(req,res)=>{
    db.collection('Stationary').findOneAndDelete({pid :req.body.pid}, (err,result)=>{
        if(err) 
          return console.log(err)
        res.redirect('/')
    })
})

