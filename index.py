import numpy as np
from numpy import genfromtxt
from keras.models import Sequential
from keras.layers.core import Dense, Activation
from keras.optimizers import SGD
from flask import Flask
from flask import Response
import json
app = Flask(__name__)

dataset="s6"

if __name__ == "__main__":
	X = genfromtxt('datasets/'+dataset+'/features.csv',delimiter=",")
	y = genfromtxt('datasets/'+dataset+'/params.csv',delimiter=",")

	print X.shape
	print y.shape

	np.random.seed(100)

	# define a network with 2 layers, 8 neurons each, tanh activation function
	# Dense is the keras name for a simple, fully connected NN layer
	print "defining network..."
	model = Sequential()
	model.add(Dense(8, input_dim=(X.shape[1]), activation="tanh"))
	model.add(Dense(16, input_dim=8, activation="tanh"))
	model.add(Dense(y.shape[1], input_dim=16, activation="tanh"))

	# add some data (need to specify data type)
	X = np.array(X, "float32")
	y = np.array(y, "float32")

	# this compiles the network and sets the loss function and optimization algorithm
	print "compiling ..."
	model.compile(loss='mse', optimizer='sgd')

	# this trains on the data 1000 times, updating after each run
	print "training ..."
	model.fit(X, y, nb_epoch=1000, batch_size=1, verbose=True)

	@app.route("/<float:rms>/<float:sc>/<float:sr>")
	def hello(rms,sc,sr):
		print float(rms)
		resp = Response(json.dumps(model.predict(np.transpose(np.array([[float(rms)],[float(sc)],[float(sr)]])))[0].tolist()))
		resp.headers['Access-Control-Allow-Origin'] = '*'
		return resp
	app.debug = True
	app.run()
